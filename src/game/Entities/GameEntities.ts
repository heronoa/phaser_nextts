class Spell {
    name: string;
    action: {
        type: "damage" | "condition" | "mixed";
        duration: number;
        damage: number;
    };

    constructor(name: string) {
        this.name = name;
    }
}

export class Unit extends Phaser.GameObjects.Sprite {
    maxHp: number;
    damage: number;
    type: string;
    hp: number;
    spells: Spell[];
    living: boolean;
    menuItem: MenuItem | null;
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame);
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage
        this.living = true;
        this.menuItem = null;
    }
    // we will use this to notify the menu item when the unit is dead
    setMenuItem(item: MenuItem) {
        this.menuItem = item;
    }
    // attack the target unit
    attack(target: Unit) {
        if (target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit(
                "Message",
                this.type +
                    " attacks " +
                    target.type +
                    " for " +
                    this.damage +
                    " damage"
            );
        }
    }

    takeDamage(damage: number) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            if (this.menuItem) this.menuItem.unitKilled();
            this.living = false;
            this.visible = false;
            this.menuItem = null;
        }
    }

    useSpell(target: Unit, spell: Spell) {
        if (spell.action.type === "damage") {
            target.takeDamage(spell.action.damage);
        }
    }
}

export class PlayerCharacter extends Unit {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame, type, hp, damage);
        this.flipX = true;

        this.setScale(2);

        this.setScale(2);
    }
}

export class Enemy extends Unit {
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string | Phaser.Textures.Texture,
        frame: string | number | undefined,
        type: string,
        hp: number,
        damage: number
    ) {
        super(scene, x, y, texture, frame, type, hp, damage);
    }
}

export class MenuItem extends Phaser.GameObjects.Text {
    constructor(
        x: number,
        y: number,
        text: string,
        scene: Phaser.Scene,
        alignment: string = "left"
    ) {
        super(scene, x, y, text, {
            color: "#ffffff",
            align: alignment,
            fontSize: 15,
        });
    }

    unitKilled() {
        this.active = false;
        this.visible = false;
    }

    select() {
        this.setColor("#f8ff38");
    }

    deselect() {
        this.setColor("#ffffff");
    }
}

export class Menu extends Phaser.GameObjects.Container {
    backButton: boolean = false;
    menuItem: MenuItem;
    menuItems: MenuItem[] = [];
    menuItemIndex: number;
    selected: boolean;
    constructor(x: number, y: number, scene: Phaser.Scene, heroes?: any) {
        // this.scene = scene
        super(scene, x, y);

        // this.addBackButton();
    }

    addBackButton() {
        const menuItem = new MenuItem(60, 0, ">>", this.scene, "right");
        this.menuItems.push(menuItem);
        this.add(menuItem);
        this.backButton = true;
    }

    addMenuItem(unit: string) {
        const len = this.backButton
            ? this.menuItems.length - 1
            : this.menuItems.length;
        const menuItem = new MenuItem(0, len * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);
        return menuItem;
    }
    moveSelectionUp() {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex--;
            if (this.menuItemIndex < 0)
                this.menuItemIndex = this.menuItems.length - 1;
        } while (!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    }
    moveSelectionDown() {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex++;
            if (this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
        } while (!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    }

    // select the menu as a whole and an element with index from it
    select(index: number) {
        if (!index) index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        while (!this.menuItems[this.menuItemIndex].active) {
            this.menuItemIndex++;
            if (this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
            if (this.menuItemIndex == index) return;
        }
        this.menuItems[this.menuItemIndex].select();
        this.selected = true;
    }
    // deselect this menu
    deselect() {
        this.menuItems[this.menuItemIndex]?.deselect();
        this.menuItemIndex = 0;
    }
    confirm() {
        // wen the player confirms his slection, do the action
    }
    clear(back: boolean = false) {
        for (let i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;

        // if (back) {
        //     this.addBackButton();
        // }

        // this.backButton = back;
    }
    remap(units: Unit[] = [], back: boolean = false) {
        this.clear();
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            unit.setMenuItem(this.addMenuItem(unit.type));
        }
        this.menuItemIndex = 0;
    }
}

export class EnemiesMenu extends Menu {
    heroes: PlayerCharacter;
    // this:Phaser.Menu; scene: Phaser.Scene; x: number; y: number;
    constructor(x: number, y: number, scene: Phaser.Scene, heroes?: any) {
        super(x, y, scene);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.heroes = heroes;
        this.x = x;
        this.y = y;
    }

    confirm() {
        this.scene.events.emit("Enemy", this.menuItemIndex);
    }
}

export class HeroesMenu extends Menu {
    spells: Unit[];
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(x, y, scene);
    }
}

export class ActionsMenu extends Menu {
    constructor(x: number, y: number, scene: Phaser.Scene) {
        super(x, y, scene);
        this.addMenuItem("Attack");
        // this.addMenuItem("Spell");
        // this.addMenuItem("Item");
        // this.addMenuItem("Run");
    }

    confirm() {
        if (this.menuItems[this.menuItemIndex]?.text === "Attack") {
            return this.scene.events.emit("SelectEnemies");
        }

        if (this.menuItems[this.menuItemIndex]?.text === "Spell") {
            return this.scene.events.emit("SelectSpell");
        }
        if (this.menuItems[this.menuItemIndex]?.text === "Item") {
            return this.scene.events.emit("SelectItem");
        }
        if (this.menuItems[this.menuItemIndex]?.text === "Confirm") {
            return this.scene.events.emit("ConfirmRun");
        }
        if (this.menuItems[this.menuItemIndex]?.text === ">") {
            return this.scene.events.emit("BackMenu");
        }
    }
}
export class SpellMenu extends Menu {
    constructor(x: number, y: number, scene: Phaser.Scene, spells: any[]) {
        super(x, y, scene);
        spells.forEach((sp) => {
            this.addMenuItem(sp.name);
        });
        this.addMenuItem("Attack");
        this.addMenuItem("Spell");
        this.addMenuItem("Item");
        this.addMenuItem("Run");
    }

    confirm() {
        if (this.menuItems[this.menuItemIndex]?.text === "Attack") {
            return this.scene.events.emit("SelectEnemies");
        }

        if (this.menuItems[this.menuItemIndex]?.text === "Spell") {
            return this.scene.events.emit("SelectSpell");
        }
        if (this.menuItems[this.menuItemIndex]?.text === "Item") {
            return this.scene.events.emit("SelectItem");
        }
        if (this.menuItems[this.menuItemIndex]?.text === "Confirm") {
            return this.scene.events.emit("ConfirmRun");
        }
        if (this.menuItems[this.menuItemIndex]?.text === ">") {
            return this.scene.events.emit("BackMenu");
        }
    }
}
export class ItemMenu extends Menu {
    constructor(x: number, y: number, scene: Phaser.Scene, spells: any[]) {
        super(x, y, scene);
        spells.forEach((sp) => {
            this.addMenuItem(sp.name);
        });
        this.addMenuItem("Potion");
    }

    confirm() {
        if (this.menuItems[this.menuItemIndex]?.text === "Attack") {
            return this.scene.events.emit("SelectItem");
        }

        if (this.menuItems[this.menuItemIndex]?.text === ">") {
            return this.scene.events.emit("BackMenu");
        }
    }
}
export class ConfirmMenu extends Menu {
    constructor(x: number, y: number, scene: Phaser.Scene, spells: any[]) {
        super(x, y, scene);
        spells.forEach((sp) => {
            this.addMenuItem(sp.name);
        });
        this.addMenuItem("Confirm");
        this.addMenuItem("Cancel");
    }

    confirm() {
        if (this.menuItems[this.menuItemIndex]?.text === "Confirm") {
            return this.scene.events.emit("ConfirmRun");
        }
        if (this.menuItems[this.menuItemIndex]?.text === "Cancel") {
            return this.scene.events.emit("BackMenu");
        }

        if (this.menuItems[this.menuItemIndex]?.text === ">") {
            return this.scene.events.emit("BackMenu");
        }
    }
}

export class Message extends Phaser.GameObjects.Container {
    graphics: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    hideEvent: Phaser.Time.TimerEvent | null;
    constructor(scene: Phaser.Scene, events: any) {
        super(scene, 160, 30);

        const graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(1, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);
        graphics.strokeRect(-90, -15, 180, 30);
        graphics.fillRect(-90, -15, 180, 30);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", {
            color: "#ffffff",
            align: "center",
            fontSize: 13,
            wordWrap: { width: 160, useAdvancedWrap: true },
        });
        this.add(this.text);
        this.text.setOrigin(0.5);
        events.on("Message", this.showMessage, this);
        this.visible = false;
    }

    showMessage(text: string | string[]) {
        this.text.setText(text);
        this.visible = true;
        if (this.hideEvent) this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({
            delay: 2000,
            callback: this.hideMessage,
            callbackScope: this,
        });
    }

    hideMessage() {
        this.hideEvent = null;
        this.visible = false;
    }
}
