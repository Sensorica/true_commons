<script lang="ts">
	import { onMount } from 'svelte';
	import type { ProcessSpecificationCreateParams } from '$lib/graphql/types';
	import processSpecificationsStore from '$lib/stores/process-specifications.store.svelte';
	import foundationService from '$lib/services/foundation.service.svelte';

	let { onProcessSpecCreated = () => {} } = $props<{
		onProcessSpecCreated?: (processSpec: any) => void;
	}>();

	// Form state
	let formData: ProcessSpecificationCreateParams = $state({
		name: '',
		note: '',
		classifiedAs: []
	});

	// UI state
	let loading = $state(false);
	let error = $state<string | null>(null);
	let validationErrors = $state<string[]>([]);
	let foundationReady = $state(false);
	let isInitializing = $state(false);
	let classificationInput = $state('');

	// Check foundation status
	onMount(async () => {
		await checkFoundationStatus();
	});

	async function checkFoundationStatus() {
		try {
			if (!foundationService.isInitialized) {
				await foundationService.initialize();
			}

			const status = await foundationService.checkFoundationRequirements();
			foundationReady = status.allReady;

			if (!foundationReady) {
				error = 'Foundation components not ready. Please initialize foundation components first.';
			}
		} catch (err) {
			error = 'Failed to check foundation status';
			console.error(err);
		}
	}

	async function initializeFoundation() {
		isInitializing = true;
		error = null;

		try {
			await foundationService.ensureFoundationData();
			await checkFoundationStatus();
		} catch (err) {
			error = 'Failed to initialize foundation components';
			console.error(err);
		} finally {
			isInitializing = false;
		}
	}

	async function validateForm(): Promise<boolean> {
		if (!foundationReady) {
			validationErrors = ['Foundation components not ready'];
			return false;
		}

		validationErrors = await processSpecificationsStore.validateProcessSpecificationData(formData);
		return validationErrors.length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (loading) return;

		const isValid = await validateForm();
		if (!isValid) return;

		loading = true;
		error = null;

		try {
			const createdProcessSpec = await processSpecificationsStore.createProcessSpecification(formData);
			onProcessSpecCreated(createdProcessSpec);

			// Reset form
			formData = {
				name: '',
				note: '',
				classifiedAs: []
			};
			classificationInput = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create process specification';
		} finally {
			loading = false;
		}
	}

	function addClassification() {
		if (classificationInput.trim() && !formData.classifiedAs.includes(classificationInput.trim())) {
			formData.classifiedAs = [...formData.classifiedAs, classificationInput.trim()];
			classificationInput = '';
		}
	}

	function removeClassification(index: number) {
		formData.classifiedAs = formData.classifiedAs.filter((_, i) => i !== index);
	}

	function handleClassificationKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			addClassification();
		}
	}
</script>

<div class="process-spec-form">
	<div class="form-header">
		<h2>Create Process Specification</h2>
		<p class="description">
			Process specifications define templates or types of processes that can be reused across different process instances.
		</p>
	</div>

	{#if !foundationReady}
		<div class="foundation-warning">
			<h3>⚠️ Foundation Components Required</h3>
			<p>
				Process specifications require foundation components to be initialized first.
			</p>
			<button
				type="button"
				class="btn btn-primary"
				onclick={initializeFoundation}
				disabled={isInitializing}
			>
				{isInitializing ? 'Initializing...' : 'Initialize Foundation Components'}
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="process-spec-form">
			<div class="form-section">
				<h3>Basic Information</h3>

				<div class="form-group">
					<label for="name">Process Specification Name *</label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						placeholder="Enter process specification name..."
						required
					/>
				</div>

				<div class="form-group">
					<label for="note">Description</label>
					<textarea
						id="note"
						bind:value={formData.note}
						placeholder="Describe what this process specification represents..."
						rows="3"
					></textarea>
				</div>
			</div>

			<div class="form-section">
				<h3>Classification</h3>

				<div class="form-group">
					<label for="classificationInput">Add Classification</label>
					<div class="classification-input-group">
						<input
							type="text"
							id="classificationInput"
							bind:value={classificationInput}
							placeholder="Enter classification (e.g., manufacturing, service, transport)..."
							onkeydown={handleClassificationKeyDown}
						/>
						<button type="button" class="btn btn-secondary" onclick={addClassification}>
							Add
						</button>
					</div>
				</div>

				{#if formData.classifiedAs.length > 0}
					<div class="classifications-list">
						<h4>Classifications:</h4>
						<div class="classification-tags">
							{#each formData.classifiedAs as classification, index}
								<span class="classification-tag">
									{classification}
									<button
										type="button"
										class="remove-btn"
										onclick={() => removeClassification(index)}
										title="Remove classification"
									>
										×
									</button>
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			{#if validationErrors.length > 0}
				<div class="error-section">
					<h3>Validation Errors</h3>
					<ul>
						{#each validationErrors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#if error}
				<div class="error-section">
					<h3>Error</h3>
					<p>{error}</p>
				</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="btn btn-primary" disabled={loading}>
					{loading ? 'Creating...' : 'Create Process Specification'}
				</button>
			</div>
		</form>
	{/if}
</div>

<style>
	.process-spec-form {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
	}

	.form-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	.form-header h2 {
		margin: 0 0 1rem 0;
		color: var(--primary-color);
	}

	.description {
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	.foundation-warning {
		background: #fff3cd;
		border: 1px solid #ffeaa7;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
		text-align: center;
	}

	.foundation-warning h3 {
		margin: 0 0 1rem 0;
		color: #856404;
	}

	.foundation-warning p {
		margin: 0 0 1rem 0;
		color: #856404;
	}

	.form-section {
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: #f8f9fa;
		border-radius: 8px;
	}

	.form-section h3 {
		margin: 0 0 1rem 0;
		color: var(--primary-color);
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 0.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.form-group input,
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
	}

	.classification-input-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.classification-input-group input {
		flex: 1;
		margin: 0;
	}

	.classifications-list {
		margin-top: 1rem;
	}

	.classifications-list h4 {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 0.9rem;
	}

	.classification-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.classification-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: var(--primary-color);
		color: white;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
	}

	.remove-btn {
		background: none;
		border: none;
		color: white;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0;
		margin-left: 0.25rem;
		line-height: 1;
	}

	.remove-btn:hover {
		color: #ffcccb;
	}

	.error-section {
		background: #f8d7da;
		border: 1px solid #f5c6cb;
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	.error-section h3 {
		margin: 0 0 0.5rem 0;
		color: #721c24;
	}

	.error-section p {
		margin: 0;
		color: #721c24;
	}

	.error-section ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #721c24;
	}

	.form-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-primary {
		background: var(--primary-color);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--primary-dark);
		transform: translateY(-2px);
	}

	.btn-secondary {
		background: #6c757d;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #5a6268;
		transform: translateY(-2px);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	@media (max-width: 768px) {
		.process-spec-form {
			padding: 1rem;
		}
		
		.form-section {
			padding: 1rem;
		}

		.classification-input-group {
			flex-direction: column;
			align-items: stretch;
		}

		.classification-input-group input {
			margin-bottom: 0.5rem;
		}
	}
</style> 