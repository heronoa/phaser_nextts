export interface Player
    extends Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    isAttacking?: boolean;
}
export const loadBulletSprites = (scene: Phaser.Scene) => {
    scene.load.image("bullet", "./bullet.png");
};

export const createBullet = (
    scene: Phaser.Scene & { water: any },
    player: Player
) => {
    const initX = player.flipX ? player.x - 40 : player.x + 40;
    const initY = player.y - 18;

    const bullet = scene.physics.add
        .image(initX, initY, "bullet")
        .setScale(0.1);

    if (player.flipX) {
        bullet.setVelocityX(-700);
        bullet.setFlipX(true);
    } else {
        bullet.setVelocityX(700);
    }
};
