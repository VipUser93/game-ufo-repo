//========================================================================
// LOAD GAME SCENE
class loadGameScene extends Phaser.Scene {
    constructor() {
        super("LoadGameScene");
    }

    preload() {
        this.load.image('bckgr-intro', '../assets/media/game/images/intro.jpg');
        this.load.image('player-graphics', '../assets/media/game/images/ufo.png');
        this.load.image('bckgr-step-1', '../assets/media/game/images/bckgr-step-1.jpg');
        this.load.spritesheet('play-btn', '../assets/media/game/images/button-start.png', {frameWidth: 201, frameHeight: 72});

        this.load.tilemapTiledJSON('map', '../assets/media/game/map/map.json');
        this.load.spritesheet('tiles', '../assets/media/game/map/tiles.png', {frameWidth: 70, frameHeight: 70});
    }
    
    create() {
        // let progressBar = this.add.graphics();
        // let progressBox = this.add.graphics();
        // let width = this.cameras.main.width;
        // let height = this.cameras.main.height;
        
        // progressBox.fillStyle(0x222222, 0.8);
        // progressBox.fillRect((width - 320) / 2, 290, 320, 50);
        
        // let loadingText = this.make.text({
        //     x: width / 2,
        //     y: height / 2 - 50,
        //     text: 'Loading...',
        //     style: {
        //         font: '20px monospace',
        //         fill: '#ffffff'
        //     }
        // });
        // loadingText.setOrigin(0.5, 0.5);

        // var percentText = this.make.text({
        //     x: width / 2,
        //     y: height / 2 - 5,
        //     text: '0%',
        //     style: {
        //         font: '18px monospace',
        //         fill: '#ffffff'
        //     }
        // });
        // percentText.setOrigin(0.5, 0.5);
        
        // var assetText = this.make.text({
        //     x: width / 2,
        //     y: height / 2 + 50,
        //     text: '',
        //     style: {
        //         font: '18px monospace',
        //         fill: '#ffffff'
        //     }
        // });
        // assetText.setOrigin(0.5, 0.5);
        
        // this.load.on('progress', function (value) {
        //     percentText.setText(parseInt(value * 100) + '%');
        //     progressBar.clear();
        //     progressBar.fillStyle(0xffffff, 1);
        //     progressBar.fillRect((width - 300) / 2, 300, 300 * value, 30);
        // });
        
        // this.load.on('fileprogress', function (file) {
        //     assetText.setText('Loading asset: ' + file.key);
        // });

        // this.load.on('complete', function () {
        //     progressBar.destroy();
        //     progressBox.destroy();
        //     loadingText.destroy();
        //     percentText.destroy();
        //     assetText.destroy();
        // });

        this.scene.start('StartGameScene');
    }
}

//========================================================================
// START GAME SCENE
class startGameScene extends Phaser.Scene {
    constructor() {
        super("StartGameScene");
    }

    create() {
        let gameObj = this;

        let introBck = this.add.sprite(0, 0, 'bckgr-intro');
        introBck.setOrigin(0, 0);

        let playButton = this.add.sprite(480, 440, 'play-btn', 0);
        playButton.setOrigin(0.5, 0.5);
        playButton.setInteractive();

        playButton.on("pointerover", function() {
            playButton.setFrame(1);
        });

        playButton.on("pointerout", function() {
            playButton.setFrame(0);
        });

        playButton.on("pointerup", function() {
            gameObj.scene.start('InGameScene');
        });
    }
}

//========================================================================
// IN GAME SCENE
class inGameScene extends Phaser.Scene {
    constructor() {
        super("InGameScene");
    }

    create() {
        this.engineLimit = this.sys.game._gameOptions.engine.limit;
        this.engineAcceleration = this.sys.game._gameOptions.engine.acceleration;
        this.enginePower = this.sys.game._gameOptions.engine.power;
        this.engineOn = false;
        this.regulationLimit = this.sys.game._gameOptions.regulation.limit;
        this.regulationAcceleration = this.sys.game._gameOptions.regulation.acceleration;
        this.regulationPower = this.sys.game._gameOptions.regulation.power;
        this.engineFuel = this.sys.game._gameOptions.engine.fuel;
        this.mapGravity = this.sys.game._gameOptions.map.gravity;

        let introBck = this.add.sprite(0, 0, 'bckgr-step-1');
        introBck.setOrigin(0, 0);

        let map = this.make.tilemap({key: 'map'});
        let groundTiles = map.addTilesetImage('tiles');

        this.sys.game._mapLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
        this.sys.game._mapLayer.setCollisionByExclusion([-1]);

        this.physics.world.bounds.width = this.sys.game._mapLayer.width;
        this.physics.world.bounds.height = this.sys.game._mapLayer.height;

        this.sys.game._player = this.physics.add.sprite(100, this.sys.game._mapLayer.height - 230, 'player-graphics');
        this.sys.game._player.setScale(1);
        this.sys.game._player.setCollideWorldBounds(true);

        let engineTextStyle = {fontSize: '18px', fill: '#fff'};
        this.engineStatusText = this.add.text(34, 34, 'Engine OFF', engineTextStyle);
        this.engineStatusText.setScrollFactor(0);

        this.engineThrottleText = this.add.text(34, 34, 'Throttle: ' + this.enginePower, engineTextStyle);
        this.engineThrottleText.setScrollFactor(0);
        this.engineThrottleText.visible = false;

        this.engineFuelText = this.add.text(34, 65, 'Fuel: ' + this.engineFuel, engineTextStyle);
        this.engineFuelText.setScrollFactor(0);
        this.engineFuelText.visible = false;

        this.physics.add.collider(this.sys.game._mapLayer, this.sys.game._player);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.sys.game._player);

        this.sys.game._cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        let userPlayer = this.sys.game._player;
        let userCursors = this.sys.game._cursors;
        
        if (!this.engineOn) {
            this.engineThrottleText.visible = false;
            this.engineFuelText.visible = false;
            this.engineStatusText.visible = true;
            
            if (this.enginePower < 400) {
                this.enginePower += 5;
            }
            if (userCursors.shift.isDown) {
                this.engineOn = true;
            }
            userPlayer.setVelocityY(this.enginePower);
        } else {
            this.engineStatusText.visible = false;
            this.engineThrottleText.visible = true;
            this.engineFuelText.visible = true;

            if (userCursors.left.isDown && userCursors.up.isDown) {              // left + up
                if (this.regulationPower > -this.regulationLimit) {
                    this.regulationPower -= this.regulationAcceleration;
                }
                if (this.enginePower > -this.engineLimit) {
                    this.enginePower -= this.engineAcceleration;
                }
                userPlayer.setVelocityX(this.regulationPower);
                userPlayer.setVelocityY(this.enginePower);
            } else if (userCursors.right.isDown && userCursors.up.isDown) {      // right + up
                if (this.regulationPower < this.regulationLimit) {
                    this.regulationPower += this.regulationAcceleration;
                }
                if (this.enginePower > -this.engineLimit) {
                    this.enginePower -= this.engineAcceleration;
                }
                userPlayer.setVelocityX(this.regulationPower);
                userPlayer.setVelocityY(this.enginePower);
            } else if (userCursors.left.isDown && userCursors.down.isDown) {     // left + down
                if (this.regulationPower > -this.regulationLimit) {
                    this.regulationPower -= this.regulationAcceleration;
                }
                if (this.enginePower < this.engineLimit) {
                    this.enginePower += this.engineAcceleration;
                }
                userPlayer.setVelocityX(this.regulationPower);
                userPlayer.setVelocityY(this.enginePower);
            } else if (userCursors.right.isDown && userCursors.down.isDown) {    // right + down
                if (this.regulationPower < this.regulationLimit) {
                    this.regulationPower += this.regulationAcceleration;
                }
                if (this.enginePower < this.engineLimit) {
                    this.enginePower += this.engineAcceleration;
                }
                userPlayer.setVelocityX(this.regulationPower);
                userPlayer.setVelocityY(this.enginePower);
            } else if (userCursors.left.isDown) {                            // left
                if (this.regulationPower > -this.regulationLimit) {
                    this.regulationPower -= this.regulationAcceleration;
                }
                userPlayer.setVelocityX(this.regulationPower);
            } else if (userCursors.right.isDown) {                           // right
                if (this.regulationPower < this.regulationLimit) {
                    this.regulationPower += this.regulationAcceleration;
                }
                userPlayer.setVelocityX(this.regulationPower);
            } else if (userCursors.up.isDown) {                              // up
                if (this.enginePower > -this.engineLimit) {
                    this.enginePower -= this.engineAcceleration;
                }
                userPlayer.setVelocityY(this.enginePower);
            } else if (userCursors.down.isDown) {                            // down
                if (this.enginePower < this.engineLimit) {
                    this.enginePower += this.engineAcceleration;
                }
                userPlayer.setVelocityY(this.enginePower);
            } else {                                                     // else
                if (this.regulationPower > 0) {
                    if (this.regulationPower <= 5) {
                        this.regulationPower -= 1;
                    } else if (this.regulationPower <= 20) {
                        this.regulationPower -= 2;
                    } else {
                        this.regulationPower -= 5;
                    }
                } else if (this.regulationPower < 0) {
                    if (this.regulationPower >= -5) {
                        this.regulationPower += 1;
                    } else if (this.regulationPower >= -20) {
                        this.regulationPower += 2;
                    } else {
                        this.regulationPower += 5;
                    }
                }
                userPlayer.setVelocityX(this.regulationPower);
                userPlayer.setVelocityY(this.enginePower);
            }

            //console.log(this.enginePower);
            //if (this.enginePower )

            this.engineThrottleText.setText('Throttle: ' + this.enginePower);
            this.engineFuelText.setText('Fuel: ' + this.engineFuel);

            if (userCursors.space.isDown) {
                this.engineOn = false;
                this.engineStatusText.visible = true;
            }
        }
    }
}
// END OF SCENES
//========================================================================

var GameApp = function() {};

GameApp.prototype.start = function() {
    // Game scenes
    let scenes = [];
    scenes.push(loadGameScene);
    scenes.push(startGameScene);
    scenes.push(inGameScene);

    // Game config
    var config = {
        type: Phaser.AUTO,
        title: 'SpaceLord',
        parent: 'game-wrapper',
        width: 960,
        height: 540,
        physics: {
            default: 'arcade',
            system: 'impact',
            arcade: {
                gravity: {y: 9.8},
                debug: false
            },
            setBounds: {
                width: 800,
                height: 600,
            }
        },
        scene: scenes
    };

    // Game create
    var game = new Phaser.Game(config);

    window.focus();
    game._gameOptions = {
        map: {
            gravity: 9.8
        },
        engine: {
            limit: 500,
            acceleration: 3,
            power: 400,
            fuel: 100
        },
        regulation: {
            limit: 500,
            acceleration: 5,
            power: 0
        }
    };
    game._player;
    game._cursors;
    game._mapLayer;
}

window.onload = function() {
    'use strict';
    var app = new GameApp();
    app.start();
}