const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'https://labs.phaser.io/assets/skies/space3.png');
}

function create() {
    this.add.image(400, 300, 'background');
}

function update() {
    // Game logic here
}
