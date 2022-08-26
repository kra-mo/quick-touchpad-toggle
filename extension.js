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

const { Gio, GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Touchpad Indicator'));

        this.icon = new St.Icon({style_class: 'system-status-icon'});
        this.schema = Gio.Settings.new('org.gnome.desktop.peripherals.touchpad');
        
        switch(this.schema.get_boolean('disable-while-typing')) {
            case true:
                this.icon.icon_name = 'touchpad-disabled-symbolic';
            break;
            case false:
                this.icon.icon_name = 'input-touchpad-symbolic';
            break;
        }
        
        this.add_child(this.icon)
        
        this.connect('button-release-event', () => {
            this.schema.set_boolean('disable-while-typing', !this.schema.get_boolean('disable-while-typing'));
            switch(this.schema.get_boolean('disable-while-typing')) {
                case true:
                    this.icon.icon_name = 'touchpad-disabled-symbolic';
                    Main.notify('Touchpad disabled while typing');
                break;
                case false:
                    this.icon.icon_name = 'input-touchpad-symbolic';
                    Main.notify('Touchpad enabled while typing');
                break;
            }
        });
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
