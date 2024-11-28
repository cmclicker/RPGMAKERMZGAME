/*:
 * @plugindesc Item Quality System - Color Item Names Based on Quality
 * @target MZ
 * @help
 * This plugin allows you to color item, skill, weapon, or armor names based on a quality value.
 *
 * Notetag Usage:
 * Add the following notetag to items, skills, weapons, or armor:
 * <Quality:X>
 * Replace X with the desired quality level:
 * 0 - Common (Grey)
 * 1 - Uncommon (Green)
 * 2 - Rare (Blue)
 * 3 - Epic (Purple)
 * 4 - Legendary (Orange)
 * 5 - Artifact (Yellow)
 *
 * Example: <Quality:3>
 *
 * Colors:
 * - 0: Grey (#808080)
 * - 1: Green (#00FF00)
 * - 2: Blue (#0000FF)
 * - 3: Purple (#800080)
 * - 4: Orange (#FFA500)
 * - 5: Yellow (#FFFF00)
 */

(() => {
    const qualityColors = {
        0: "#a6a6a6", // Poor (Gray)
        1: "#ffffff", // Common (White)
        2: "#77ff65", // Uncommon (Green)
        3: "#2c98ff", // Rare (Blue)
        4: "#b056ed", // Epic (Purple)
        5: "#ff8000", // Legendary (Orange)
        6: "#e6cc80", // Artifact (Light Gold)
        7: "#00ccff", // Heirloom (Blizzard Blue)
        8: "#ff548d"  // Mythic (Pink-Red)
    };

    /**
     * Reads the quality value from the notetag <Quality:X>
     */
    const getQuality = (item) => {
        if (item && item.meta && item.meta.Quality) {
            const quality = parseInt(item.meta.Quality, 10);
            return isNaN(quality) ? 0 : quality;
        }
        return 0; // Default to Common
    };

    Window_Base.prototype.drawItemName = function (item, x, y, width) {
        if (item) {
            const iconBoxWidth = ImageManager.iconWidth + 4; // Adjust spacing between icon and text
            const quality = getQuality(item);
            const color = qualityColors[quality] || this.normalColor();

            // Draw the icon
            this.drawIcon(item.iconIndex, x, y);

            // Draw the item name with the quality-based color
            this.changeTextColor(color);
            this.drawText(item.name, x + iconBoxWidth, y, (width || 312) - iconBoxWidth); // Adjust for icon width
            this.resetTextColor(); // Reset AFTER drawing
        }
    };

})();
