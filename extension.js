/* Quick Touchpad Toggle GNOME Shell Extension
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const {Gio, GObject} = imports.gi;
const {PACKAGE_VERSION} = imports.misc.config;

const QuickSettings = imports.ui.quickSettings;
const QuickSettingsMenu = imports.ui.main.panel.statusArea.quickSettings;

const FeatureToggle = GObject.registerClass(
class FeatureToggle extends QuickSettings.QuickToggle {
    _init() {
        super._init({
            [Number(PACKAGE_VERSION.split('.')[0]) >= 44 ? 'title' : 'label']: 'Touchpad',
            toggleMode: true,
        });

        this._settings = new Gio.Settings({schema_id: 'org.gnome.desktop.peripherals.touchpad'});

        this._settings.bind('disable-while-typing',
            this, 'checked',
            Gio.SettingsBindFlags.INVERT_BOOLEAN);

        this._iconName();

        this._settings.connect('changed::disable-while-typing', () => {
            this._iconName();
        });
    }

    _iconName() {
        switch (this._settings.get_boolean('disable-while-typing')) {
        case true:
            this.iconName = 'touchpad-disabled-symbolic';
            break;
        case false:
            this.iconName = 'input-touchpad-symbolic';
            break;
        }
    }
});

const FeatureIndicator = GObject.registerClass(
class FeatureIndicator extends QuickSettings.SystemIndicator {
    _init() {
        super._init();

        this._indicator = this._addIndicator();
        this._indicator.iconName = 'input-touchpad-symbolic';

        this._settings = new Gio.Settings({schema_id: 'org.gnome.desktop.peripherals.touchpad'});

        this._settings.bind('disable-while-typing',
            this._indicator, 'visible',
            Gio.SettingsBindFlags.INVERT_BOOLEAN);

        this.quickSettingsItems.push(new FeatureToggle());

        this.connect('destroy', () => {
            this.quickSettingsItems.forEach(item => item.destroy());
        });

        QuickSettingsMenu._indicators.add_child(this);
        QuickSettingsMenu._addItems(this.quickSettingsItems);
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        this._indicator = null;
    }

    enable() {
        this._indicator = new FeatureIndicator();
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
