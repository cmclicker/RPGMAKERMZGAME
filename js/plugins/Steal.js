/*:
 * @target MZ
 * @plugindesc Steal System with LUK-Based Success and Dynamic Loot
 *
 * @help
 * Use <Steal> in a skill's notetag to mark it as a steal ability.
 * Use <ID: XXXX> in an item's notetag to associate it with an enemy.
 * 
 * Success Formula:
 * Base Rate + (User LUK - Target LUK) / 100
 * 
 * Notes:
 * - Loot availability is reset at the start of each battle.
 * - Enemies can have multiple loot items.
 * - Success depends on the success formula.
 */

(() => {
    // Save the original BattleManager.setup function
    const _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function (troopId, canEscape, canLose) {
        _BattleManager_setup.call(this, troopId, canEscape, canLose);

        $gameTroop.members().forEach((enemy) => {
            enemy._loot = [];

            // Add loot dynamically from item notetags
            $dataItems.forEach((item) => {
                if (item && item.meta.ID && parseInt(item.meta.ID) === enemy.enemyId()) {
                    enemy._loot.push(item);
                }
            });

            console.log(`Enemy: ${enemy.name()}, Loot: ${enemy._loot.map(i => `${i.name} (ID: ${i.id})`)}`); // Add ID to console log

            // Store the loot globally so it can be accessed in the bestiary
            if (!$gameSystem._enemyLootData) {
                $gameSystem._enemyLootData = {};
            }
            if (!($gameSystem._enemyLootData[enemy.enemyId()])) {
                $gameSystem._enemyLootData[enemy.enemyId()] = enemy._loot.map(loot => ({ id: loot.id, name: loot.name }));
            }
        });
    };

    // Save the original Game_Action.apply function
    const _Game_Action_apply = Game_Action.prototype.apply;

    // Steal success logic
    Game_Action.prototype.apply = function (target) {
        _Game_Action_apply.call(this, target); // Call the original method

        if (this.item() && this.item().meta.Steal && target.isEnemy()) {
            const user = this.subject();
            const enemy = target;

            console.log(`Steal Attempt: ${user.name()} -> ${enemy.name()}`); // Debug log

            // Steal success formula: Base + (User LUK - Target LUK) / 100
            const baseRate = 50; // Base success rate
            const successRate = Math.max(0, baseRate + (user.luk - enemy.luk) / 100);
            console.log(`Success Rate: ${successRate}%`); // Debug log

            // Roll for success
            if (Math.random() < successRate / 100) {
                console.log(`Steal Success! Remaining Loot: ${enemy._loot.length}`); // Debug log
                if (enemy._loot.length > 0) {
                    const lootIndex = Math.floor(Math.random() * enemy._loot.length);
                    const loot = enemy._loot.splice(lootIndex, 1)[0];
                    $gameParty.gainItem(loot, 1);
                    const lootName = loot.name || "an item";
                    $gameMessage.add(`${user.name()} stole ${lootName} from ${enemy.name()}!`);

                    // Save stolen loot to global loot data
                    $gameSystem.addLootForEnemy(enemy.enemyId(), loot);
                } else {
                    $gameMessage.add(`${enemy.name()} has nothing left to steal!`);
                }
            } else {
                console.log("Steal Failed!"); // Debug log
                $gameMessage.add(`${user.name()} failed to steal from ${enemy.name()}!`);
            }
        }
    };

})();
