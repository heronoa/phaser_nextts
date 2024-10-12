export interface Player
    extends Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    isAttacking?: boolean;
}
export const loadPlayerSprites = (scene: Phaser.Scene) => {
    const frameOptions = {
        frameWidth: 83,
        frameHeight: 64,
        spacing: 45,
    };
    scene.load.spritesheet("playerIdle", "./player/idle.png", frameOptions);
    scene.load.spritesheet("playerAttack", "./player/attack.png", frameOptions);
    scene.load.spritesheet("playerMove", "./player/walk.png", frameOptions);
};

export const createAnimations = (scene: Phaser.Scene, player: Player) => {
    scene.anims.create({
        key: "playerIdle",
        frames: scene.anims.generateFrameNames("playerIdle", {
            start: 0,
            end: 7,
        }),
        frameRate: 8,
        repeat: -1,
        yoyo: true,
    });
    scene.anims.create({
        key: "playerMove",
        frames: scene.anims.generateFrameNames("playerMove", {
            start: 0,
            end: 6,
        }),
        frameRate: 8,
        repeat: -1,
    });
    scene.anims.create({
        key: "playerAttack",
        frames: scene.anims.generateFrameNames("playerAttack", {
            start: 0,
            end: 3,
        }),
        frameRate: 12,
        repeat: 0,
    });

    player.on(
        "animationcomplete",
        (animation: any) => {
            console.log({ animation });
            if (animation.key === "playerAttack") {
                player.isAttacking = false;
            }
        },
        scene
    );
};

export const createPlayer = (
    scene: Phaser.Scene,
    initialCords: { x: number; y: number }
): Player => {
    const player = scene.physics.add.sprite(
        initialCords.x,
        initialCords.y,
        "playerIdle"
    );

    createAnimations(scene, player);
    return player;
};
