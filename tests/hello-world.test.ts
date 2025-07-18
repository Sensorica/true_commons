import { assert, test } from "vitest";

import { AppBundleSource } from "@holochain/client";
import { dhtSync, runScenario } from "@holochain/tryorama";

test("send hello and retrieve hellos", async () => {
  await runScenario(async scenario => {
    // Construct proper paths for your app.
    // This assumes app bundle created by the `hc app pack` command.
    const testAppPath = process.cwd() + "/../workdir/hello-world.happ";

    // Set up the app to be installed
    const appBundleSource: AppBundleSource = { type: "path", value: testAppPath };
    const appSource = { appBundleSource };

    // Add 2 players with the test app to the Scenario. The returned players
    // can be destructured.
    const [alice, beto] = await scenario.addPlayersWithApps([appSource, appSource]);

    // Shortcut peer discovery through gossip and register all agents in every
    // conductor of the scenario.
    await scenario.shareAllAgents();

    // Alice sends a hello
    const aliceCell = alice.cells[0];
    const resultAlice = await aliceCell.callZome({
      zome_name: "hello_world",
      fn_name: "hello_world",
      payload: "hello world!",
    });
    assert.ok(resultAlice);

    // Beto sends a hello
    const betoCell = beto.cells[0];
    const resultBeto = await betoCell.callZome({
      zome_name: "hello_world",
      fn_name: "hello_world",
      payload: "hola mundo!",
    });
    assert.ok(resultBeto);

    await dhtSync([alice, beto], alice.cells[0].cell_id[0]);

    // Alice gets all hellos
    const hellosAlice: Array<any> = await aliceCell.callZome({
      zome_name: "hello_world",
      fn_name: "get_hellos",
      payload: undefined,
    });

    // confirm that both hellos are present
    assert.equal(hellosAlice.length, 2);
    assert.equal(hellosAlice[0].message, "hello world!");
    assert.deepEqual(hellosAlice[0].author, aliceCell.cell_id[1]);
    assert.equal(hellosAlice[1].message, "hola mundo!");
    assert.deepEqual(hellosAlice[1].author, betoCell.cell_id[1]);
  });
});
