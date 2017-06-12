// Michael van Diest
// michaelvandiest.com
// Flappy Bird with a twist

var game = new Phaser.Game(320, 480, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });

function preload() 
{
    game.load.spritesheet('bird', "images/bird.png", 34, 24);
    game.load.spritesheet('explosion', "images/explosion.png", 32, 32);
    game.load.image('splash', "images/splash.png");
    game.load.image('pipeup', "images/pipe-up.png");
    game.load.image('pipedown', "images/pipe-down.png");
    game.load.image('pipe', "images/pipe.png");
    game.load.image('bullet', "images/bullet.png");
    game.load.image('brick', "images/brick.png");
    game.load.image('sky', "images/sky.png");
    
    game.load.audio('jump', "sounds/sfx_wing.ogg");
    game.load.audio('die', "sounds/sfx_hit.ogg");
}

var start = false;
var splash;
var player;
var jumpSpeed = 247;
var spacebar;
var pipes;
var pipeTimer;
var pipeSpace = 133;
var speed = 130;
var bricks;
var weapon;
var score = 0;
var scoreText;
var bg;

function create()
{
    game.stage.backgroundColor = '4ec0ca';
    bg = game.add.tileSprite(0, game.height-109, game.width, game.height, 'sky');
    
    //Splash
    splash = game.add.sprite(0, 0, 'splash');
    splash.anchor.setTo(0.5, 0.5);
    splash.x = game.width/2;
    splash.y = game.height/2;
    splash.alpha = 0;
    game.add.tween(splash).to({alpha: 1}, 1000, 'Sine.easeInOut', true, 100, 0, false);
    
    //Enable Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    //Player
    player = game.add.sprite(32, game.height/2, 'bird');
    player.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(player);
    player.animations.add('fly', [0, 1, 2, 3], 10, true);
    player.animations.play('fly');
    
    //Weapon
    weapon = game.add.weapon(10, 'bullet');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 600;
    weapon.fireRate = 100;
    weapon.fireAngle = 0;
    weapon.trackSprite(player, 0, 0, false);

    //Input
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spacebar.onDown.add(tap, this);
    game.input.mouse.capture = true;
    game.input.onDown.add(tap, this);
    
    //bricks
    bricks = game.add.group();
    
    //Pipes
    pipes = game.add.group();
    pipeTimer = game.time.create(false);
    pipeTimer.loop(2000, spawnPipes, this);
    
    //Score
    var style = {fill:"#fff", boundsAlignH:"center"};
    scoreText = game.add.text(0, 0, score, style);
    scoreText.setTextBounds(0, 0, game.width, game.height);
    scoreText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
}

function update()
{
    //scroll bg
    bg.tilePosition.x -= 1;
    
    //Rotate player
    if (start)
    {
        if (player.angle < 90) player.angle += 2.5;
        else player.angle = 90;
    }
    
    //Restart game
    var hitWall = game.physics.arcade.collide(player, pipes);
    var hitBrick = game.physics.arcade.collide(player, bricks);
    if (hitWall || hitBrick || player.y > game.height || player.y < 0)
    {
        gameOver();
    }
    
    //bullets
    game.physics.arcade.overlap(weapon.bullets, pipes, killBullet);
    game.physics.arcade.overlap(weapon.bullets, bricks, killBricks);
    
    //delete pipes
    pipes.forEach(function(pipe)
    {
        if (pipe.x < -50)
        {
            pipe.destroy();
            updateScore(0.25);
        }
    }, this);
}

function tap()
{
    var jump = game.add.audio('jump');
    jump.play();
    game.camera.shake(0.01, 75);
    player.angle = -45;
    player.body.velocity.y = -jumpSpeed;
    weapon.fire();
    
    if (!start)
    {
        start = true;
        pipeTimer.start();
        score = 0;
        scoreText.text = score;
        player.body.gravity.y = 800;
        game.add.tween(splash).to({alpha: 0}, 1000, 'Sine.easeInOut', true, 0, 0, false);
    }
}

function killBullet(bullet, wall)
{
    explode(bullet);
    bullet.kill();
}

function killBricks(bullet, brick)
{
    explode(brick);
    bullet.kill();
    brick.kill();
    updateScore(1);
}

function explode(sprite)
{
    var explosion = game.add.sprite(sprite.x, sprite.y, 'explosion');
    explosion.animations.add('explode', [0, 1, 2, 3, 4], 20, false);
    explosion.animations.play('explode', 20, false, true);
    game.physics.arcade.enable(explosion);
    explosion.body.velocity.x = -speed;
}

function updateScore(value)
{
    score += value;
    scoreText.text = Phaser.Math.roundTo(score);
}

function spawnPipes()
{
    var pipeposition = game.rnd.integerInRange(90, 280);
    //Top Pipe
    var pipe1 = game.add.sprite(game.width+60, 0, 'pipedown');
    game.add.tween(pipe1).to({y:[0, pipeposition]}, 1000, "Sine.easeInOut", true, 0, 0, false);
    var tube1 = game.add.tileSprite(0, 0, 50, pipeposition, 'pipe');
    game.add.tween(tube1).to({y:[-pipeposition, 0]}, 1000, "Sine.easeInOut", true, 0, 0, false);
    tube1.x = pipe1.x;
    pipes.add(tube1);
    pipes.add(pipe1);
    //Bottom Pipe
    var pipe2 = game.add.sprite(game.width+60, 0, 'pipeup');
    game.add.tween(pipe2).to({y:[game.height, pipeposition+pipeSpace]}, 1000, "Sine.easeInOut", true, 0, 0, false);
    var tube2 = game.add.tileSprite(0, pipeposition+pipeSpace, 50, game.height, 'pipe');
    game.add.tween(tube2).to({y:[game.height, pipeposition+pipeSpace]}, 1000, "Sine.easeInOut", true, 0, 0, false);
    tube2.x = pipe2.x;
    pipes.add(tube2);
    pipes.add(pipe2);
    //Bricks
    var brick1 = game.add.sprite(game.width+68, 0, 'brick');
    game.add.tween(brick1).to({y:[0, pipeposition+27]}, 1000, "Sine.easeInOut", true, 0, 0, false);
    var brick2 = game.add.sprite(game.width+68, game.height, 'brick');
    game.add.tween(brick2).to({y:[game.height, pipeposition+27+74]}, 1000, "Sine.easeInOut", true, 0, 0, false);
    bricks.add(brick1);
    bricks.add(brick2);
    //physics
    game.physics.arcade.enable([pipe1, tube1, pipe2, tube2, brick1, brick2]);
    pipe1.body.velocity.x = -speed;
    tube1.body.velocity.x = -speed;
    pipe2.body.velocity.x = -speed;
    tube2.body.velocity.x = -speed;
    brick1.body.velocity.x = -speed;
    brick2.body.velocity.x = -speed;
}

function gameOver()
{
    var die = game.add.audio('die');
    die.play();
    player.body.gravity.y = 0;
    player.y = game.height/2;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    player.angle = 0;
    pipes.removeAll(true);
    bricks.removeAll(true);
    pipeTimer.stop(false);
    start = false;
    game.add.tween(splash).to({alpha: 1}, 1000, 'Sine.easeInOut', true, 0, 0, false);
}