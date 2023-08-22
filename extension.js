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

import Gio from 'gi://Gio';
import GObject from 'gi://GObject';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

import {panel} from 'resource:///org/gnome/shell/ui/main.js';

const FeatureToggle = GObject.registerClass(
class FeatureToggle extends QuickToggle {
    _init() {
        super._init({
            title: 'Touchpad',
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
class FeatureIndicator extends SystemIndicator {
    _init() {
        super._init();

        this._indicator = this._addIndicator();
        this._indicator.iconName = 'input-touchpad-symbolic';

        this._settings = new Gio.Settings({schema_id: 'org.gnome.desktop.peripherals.touchpad'});

        this._settings.bind('disable-while-typing',
            this._indicator, 'visible',
            Gio.SettingsBindFlags.INVERT_BOOLEAN);
    }
});

export default class QuickTouchpadToggleExtension extends Extension {
    enable() {
        this._indicator = new FeatureIndicator(this);
        this._indicator.quickSettingsItems.push(new FeatureToggle(this));

        panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
    }
}