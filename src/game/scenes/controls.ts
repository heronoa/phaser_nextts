import { createBullet } from "./bullet";
import { createAnimations, Player } from "./player";

export const createControls = (scene: Phaser.Scene) => {
    return scene.input.keyboard?.createCursorKeys();
};

export const configControls = (
    player: Player,
    controls: Phaser.Types.Input.Keyboard.CursorKeys,
    scene: Phaser.Scene
) => {
    player.setVelocityX(0);
    player.setVelocity(0);

    if (player.isAttacking) {
        return;
    }

    if (controls.down.isDown) {
        moveDown(player);
        return;
    }
    if (controls.up.isDown) {
        moveUp(player);
        return;
    }
    if (controls.left.isDown) {
        moveLeft(player);
        return;
    }
    if (controls.right.isDown) {
        moveRight(player);
        return;
    }
    if (controls.space.isDown) {
        if (!player.isAttacking) {
            attack(player, scene);
        }
        return;
    }

    if (!player.isAttacking) player.anims.play("playerIdle");
};

const defaultVelocity = 200;
export const moveRight = (
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
): void => {
    player.setFlipX(false);
    player.anims.play("playerMove", true);
    player.setVelocityX(defaultVelocity);
};
export const moveLeft = (
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
): void => {
    player.setFlipX(true);
    player.anims.play("playerMove", true);
    player.setVelocityX(-defaultVelocity);
};
export const moveUp = (
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
): void => {
    player.anims.play("playerMove", true);
    player.setVelocityY(-defaultVelocity);
};
export const moveDown = (
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
): void => {
    player.anims.play("playerMove", true);
    player.setVelocityY(defaultVelocity);
};
export const attack = (player: Player, scene: Phaser.Scene): void => {
    player.isAttacking = true;
    player.anims.play("playerAttack", true);
    createBullet(scene, player);
};
