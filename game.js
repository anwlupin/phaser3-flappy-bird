//* Source: https://phaser.io/tutorials/making-your-first-phaser-3-game

var config = {
  type: Phaser.AUTO, //? Type of rendering context WEBGL or CANVAS
  // Screen resolution
  width: 286,
  height: 510,

  //* Phaser Arcade Physics
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var assets = {
  background: ["background1", "background2"],
  pipe: ["pipeGreen", "pipeRed"],
  bird: ["bird1", "bird2", "bird3"],
};
var sprite = {
  background: "background1",
  pipe: "pipeGreen",
  bird: "bird1",
};

var pipes;
var gaps;
var ground;
var faby; //? Name of the flappy bird
var spaceKey;
var score = 0;
var scoreCount;
var gameOver = false;
var isPlaying = false;

var game = new Phaser.Game(config);

function preload() {
  this.load.image("background1", "assets/background1.png");
  this.load.image("background2", "assets/background2.png");
  this.load.image("pipeGreenTop", "assets/pipeGreenTop.png");
  this.load.image("pipeGreenBottom", "assets/pipeGreenBottom.png");
  this.load.image("pipeRedTop", "assets/pipeRedTop.png");
  this.load.image("pipeRedBottom", "assets/pipeRedBottom.png");
  this.load.image("gap", "assets/gap.png");
  this.load.image("0", "assets/0.png");
  this.load.image("1", "assets/1.png");
  this.load.image("2", "assets/2.png");
  this.load.image("3", "assets/3.png");
  this.load.image("4", "assets/4.png");
  this.load.image("5", "assets/5.png");
  this.load.image("6", "assets/6.png");
  this.load.image("7", "assets/7.png");
  this.load.image("8", "assets/8.png");
  this.load.image("9", "assets/9.png");
  this.load.spritesheet("ground", "assets/ground.png", {
    frameWidth: 336,
    frameHeight: 112,
  });
  this.load.spritesheet("bird1", "assets/bird1.png", {
    frameWidth: 34,
    frameHeight: 24,
  });
  this.load.spritesheet("bird2", "assets/bird2.png", {
    frameWidth: 34,
    frameHeight: 24,
  });
  this.load.spritesheet("bird3", "assets/bird3.png", {
    frameWidth: 34,
    frameHeight: 24,
  });
}

function create() {
  pickSprite();

  //* Create
  this.add.image(143, 255, sprite.background);

  ground = this.physics.add.sprite(144, 458, "ground");
  ground.setCollideWorldBounds(true);
  ground.setDepth(10);

  pipes = this.physics.add.group();
  gaps = this.physics.add.group();

  faby = this.physics.add.sprite(120, 200, sprite.bird);
  faby.body.allowGravity = false;

  scoreCount = this.physics.add.staticGroup();
  scoreCount.create(143, 51, "0").setDepth(10);

  spaceKey = this.input.keyboard.addKey("space");

  //* Animation
  this.anims.create({
    key: "ground-moving",
    frames: this.anims.generateFrameNumbers("ground", { start: 0, end: 2 }),
    frameRate: 8,
    repeat: -1,
  });

  this.anims.create({
    key: "faby-flap",
    frames: this.anims.generateFrameNumbers(sprite.bird, { start: 0, end: 2 }),
    frameRate: 15,
    repeat: -1,
  });

  ground.anims.play("ground-moving", true);
  faby.anims.play("faby-flap", true);

  this.physics.add.overlap(faby, gaps, updateScore, null, this);
  this.physics.add.collider(faby, ground, end, null, this);
  this.physics.add.collider(faby, pipes, end, null, this);
}

function update() {
  if (!isPlaying)
    if (spaceKey.isDown) {
      this.time.addEvent({
        delay: 1500,
        callback: spawnPipe,
        callbackScope: this,
        loop: true,
      });

      isPlaying = true;
      faby.body.allowGravity = true;
    }

  if (!gameOver && isPlaying) {
    if (spaceKey.isDown) {
      faby.setVelocityY(-220);
      faby.angle = -30;
    } else if (faby.angle < 90) faby.angle += 1;

    pipes.children.iterate(function (child) {
      if (child === undefined) return;
      if (child.x < -50) child.destroy();
      else child.setVelocityX(-100);
    });

    gaps.children.iterate(function (child) {
      child.setVelocityX(-100);
    });
  }
}

function pickSprite() {
  let themeNumber = Phaser.Math.Between(0, 1);
  sprite.background = assets.background[themeNumber];
  sprite.pipe = assets.pipe[themeNumber];
  sprite.bird = assets.bird[Phaser.Math.Between(0, 2)];
}

function spawnPipe() {
  const position = Phaser.Math.Between(-120, 120);
  const pipeTop = pipes.create(312, position, sprite.pipe + "Top");
  const pipeBottom = pipes.create(312, position + 420, sprite.pipe + "Bottom");
  const gap = gaps.create(312, position + 210, "gap");

  pipeTop.body.allowGravity = false;
  pipeBottom.body.allowGravity = false;
  gap.body.allowGravity = false;
}

function updateScore(_, gap) {
  gap.destroy();
  score += 1;

  scoreCount.clear(true, true);

  const scoreString = score.toString();

  if (scoreString.length == 1)
    scoreCount.create(143, 51, scoreString).setDepth(10);
  else {
    let position = 143 - (scoreString.length * 24) / 4;
    for (let i = 0; i < scoreString.length; i++) {
      scoreCount.create(position, 51, scoreString[i]).setDepth(10);
      position += 24;
    }
  }
}

function end() {
  this.physics.pause();

  ground.anims.stop("ground-moving", true);
  faby.anims.stop("faby-flap", true);

  gameOver = true;
}
