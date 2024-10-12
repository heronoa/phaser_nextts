export interface Player
    extends Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    isAttacking?: boolean;
}
export const loadSlimeSprites = (scene: Phaser.Scene) => {
    const frameOptions = {
        frameWidth: 20,
        frameHeight: 17,
        spacing: 0,
    };
    scene.load.spritesheet("slimeIdle", "./slime.png", frameOptions);
};

export const createSlimeAnimation = (scene: Phaser.Scene) => {
    scene.anims.create({
        key: "slimeIdle",
        frames: scene.anims.generateFrameNames("slimeIdle", {
            start: 0,
            end: 6,
        }),
        frameRate: 8,
        repeat: -1,
    });
};

export const createSlime = (scene: Phaser.Scene) => {
    const slime = scene.physics.add.sprite(400, 200, "slimeIdle").setScale(2);
    slime.anims.play("slimeIdle", true);
};
