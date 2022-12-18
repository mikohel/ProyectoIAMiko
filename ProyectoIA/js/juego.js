
var menu;
var radio = 250;
var velocidadNaruto=200;
//datos de entrada
var velocidadNaruto=350;
var direccionPelota;
var distanciaRasengan;
var posicionRasengan;

//datos de salida
var statusIzquierda;
var statusDerecha;
var statusArriba;
var statusAbajo;
var aceptacion = 0.49;


var correr_der;  //tecla 
var correr_izq;  //tecla
var correr_arr;  //tecl
var correr_aba;  //tecla 

var w=900
var h=1000;
var fondo;
var ball

//declaracion de INfo Neuronas
var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;


var game = new Phaser.Game(900, 1000, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

//montamos todas las imagenes o sprites a utilizar
function preload() {
    game.load.image('fondo', 'assets/img/fondo.jpg');
    game.load.image('menu', 'assets/img/menu.png');
    game.load.spritesheet('naruto', 'assets/img/narutos3.png',35,50,20);
    game.load.spritesheet('rasengan', 'assets/img/ball2.png',310,260,4);
    game.load.spritesheet('rasengan2', 'assets/img/pangball.png');
    game.load.spritesheet('rasengan3', 'assets/img/pangball.png');



    
}
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    //anadimos las imagenes a utilizar
    fondo = game.add.tileSprite(0, 0, w, h, 'fondo');
    rasengan = game.add.sprite(100, 100, 'rasengan');
    rasengan2 = game.add.sprite(500, 600, 'rasengan2');
    rasengan3 = game.add.sprite(700, 100, 'rasengan3');
    narutos = game.add.sprite(450, 500, 'naruto');

    //la siguiente linea monta los sprites 
    game.physics.enable(narutos, Phaser.Physics.ARCADE);
    game.physics.arcade.enable([rasengan,rasengan2,rasengan3])
    narutos.body.collideWorldBounds=true;
    narutos.smoothed = true;   
    rasengan.smoothed = true;

    narutos.body.immovable = true;
    narutos.scale.x += .5;
    narutos.scale.y += .5;
    
    rasengan.scale.x -= .8;
    rasengan.scale.y -= .8;
    //  This gets it moving
    rasengan.body.velocity.setTo(130, 130);
    rasengan2.body.velocity.setTo(130, 130);
    rasengan3.body.velocity.setTo(130, 130);


    //  This makes the game world bounce-able se activan las fisicas al shuriquen
    rasengan.body.collideWorldBounds = true;
    rasengan2.body.collideWorldBounds = true;
    rasengan3.body.collideWorldBounds = true;

    //  This sets the image bounce energy for the horizontal 
    //  and vertical vectors (as an x,y point). "1" is 100% energy return
    rasengan.body.bounce.setTo(1, 1);
    rasengan2.body.bounce.setTo(1, 1);
    rasengan3.body.bounce.setTo(1, 1);

    narutos .anchor.setTo(1, 1);

    //definimos los sprites
    var shuriken = rasengan.animations.add('shuriken',[0,1,2,3]);
   var quieto = narutos.animations.add('quieto',[0,1,2,3,4,5]);
   var correrd = narutos.animations.add('correr-derecha',[9,10,11]);
   var correrizq = narutos.animations.add('correr-izquierda',[20,19,18,14]);
   var correrarr = narutos.animations.add('correr-arriba',[0,1,2,3,4,5]);
   var correraba = narutos.animations.add('correr-abajo',[0,1,2,3,4,5]);

    narutos.animations.play('quieto', 10, true);  //animacion en curso
    rasengan.animations.play('shuriken', 10, true);  //animacion en curso

    correr_der = game.input.keyboard.addKey(Phaser.Keyboard.D);
    correr_izq = game.input.keyboard.addKey(Phaser.Keyboard.A);
    correr_arr = game.input.keyboard.addKey(Phaser.Keyboard.W);
    correr_aba = game.input.keyboard.addKey(Phaser.Keyboard.S);


    pausaL = game.add.text(w - 100, 20, "Pausa", {
        font: "20px Arial",
        fill: "#fff",
    });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    game.input.onDown.add(mPausa, self);
//RED NEURONAL
    nnNetwork =  new synaptic.Architect.Perceptron(12, 8,8,8, 4);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

//Terminando de entrenar la red neuronal
function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 10000,log: 1000, shuffle: true});
}

//DEFINO MIS ENTRADAS DE LA PELOTA
function datosDeEntrenamiento(param_entrada){
    console.log("Entrada",param_entrada[0]+" "+param_entrada[1]+" "+param_entrada[2]+param_entrada[3]);
    //manda la informacion a la red
    nnSalida = nnNetwork.activate(param_entrada);
    //Probabilidades de seleccionar una opcion, IZQ, DERECHA O CENTRO ARRIB ABAJO
    statusArriba =Math.round( nnSalida[0]*100 );
    statusAbajo =Math.round( nnSalida[1]*100 );
    statusIzquierda=Math.round( nnSalida[2]*100 );
    statusDerecha=Math.round( nnSalida[3]*100 );

   

    console.log(
        "Arriba: " +
        statusArriba +
        " Abajo: " +
        statusAbajo +
        " Izquierda: " +
        statusIzquierda +
        " Derecha: " +
        statusDerecha+
        " nnSalida: "+
        nnSalida
      
    );

    var nMayor = 0;
    var retorno = [false,false,false,false];
    var posicion = 0;
    var aux1=0;
    var aux2=0;

    /**for (var i = 0; i < nnSalida.length; i++) {
        if (nnSalida[i] < aceptacion) {
            retorno.push(false);
        } else {
            retorno.push(true);
            if (i==0){
                nnSalida[1]=40;
            }
            if (i==2) {
                nnSalida[3]=40;
            }
        }
    }*/


    for (var i = 0; i < 4; i++) {
        aux1 =Math.max(...nnSalida)
        if(aux1>=aceptacion){
            aux2 = nnSalida.indexOf(Math.max(...nnSalida))
            switch(aux2){
                case 0:
                    retorno[0]=true;
                    nnSalida[0]=0;
                    nnSalida[1]=0;
                break;
                case 1:
                    retorno[1]=true;
                    nnSalida[0]=0;
                    nnSalida[1]=0;
                break;
                case 2:
                    retorno[2]=true;
                    nnSalida[2]=0;
                    nnSalida[3]=0;
                break;
                case 3:
                    retorno[3]=true;
                    nnSalida[2]=0;
                    nnSalida[3]=0;
                break;
                default:
                    break;
            }
        }
    }
    return retorno;
}


function pausa(){
    game.paused = true;
    menu = game.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(.5, 0.5);
}


function mPausa(event) {
    if (game.paused) {
        var menu_x1 = w / 2 - 270 / 2,
            menu_x2 = w / 2 + 270 / 2,
            menu_y1 = h / 2 - 180 / 2,
            menu_y2 = h / 2 + 180 / 2;

        var mouse_x = event.x,
            mouse_y = event.y;

        if (
            mouse_x > menu_x1 &&
            mouse_x < menu_x2 &&
            mouse_y > menu_y1 &&
            mouse_y < menu_y2
        ) {
            if (
                mouse_x >= menu_x1 &&
                mouse_x <= menu_x2 &&
                mouse_y >= menu_y1 &&
                mouse_y <= menu_y1 + 90
            ) {
                eCompleto = false;
                datosEntrenamiento = [];
                modoAuto = false;
                this.game.state.restart();


            } else if (
                mouse_x >= menu_x1 &&
                mouse_x <= menu_x2 &&
                mouse_y >= menu_y1 + 90 &&
                mouse_y <= menu_y2
            ) {                

                if (!eCompleto) {

                    console.log(
                        "",
                        "Entrenamiento " + datosEntrenamiento.length + " valores"
                    );
                    enRedNeural();
                    eCompleto = true;
                }                this.game.state.restart();

                modoAuto = true;
            }

            menu.destroy();

            game.paused = false;
        }
    }
}





function correrR(){
    narutos.animations.play('correr-derecha',10,true);  
}

function correrL(){
    narutos.animations.play('correr-izquierda',10,true);  
}

function correrU(){
    narutos.animations.play('correr-arriba',10,true);  
}

function correrD(){
    narutos.animations.play('correr-abajo',10,true);  
}

function quieto(){
    narutos.animations.play('quieto');  
}

function update () {

     //Si el juego colisiona (se llama la funcion colisionH) y pausa el juego
    game.physics.arcade.collide(rasengan, narutos, colisionShuriken, null, this);
    game.physics.arcade.collide(rasengan2, narutos, colisionShuriken, null, this);
    game.physics.arcade.collide(rasengan3, narutos, colisionShuriken, null, this);
    game.physics.arcade.collide(rasengan, rasengan2);
    game.physics.arcade.collide(rasengan, rasengan3);
    game.physics.arcade.collide(rasengan2, rasengan3);
    narutos.body.velocity.setTo(0, 0);


    narutosPos = [narutos.body.position.x, narutos.body.position.y];
    rasenganPos = [rasengan.body.position.x,rasengan.body.position.y];
    rasengan2Pos = [rasengan2.body.position.x,rasengan2.body.position.y];
    rasengan3Pos = [rasengan3.body.position.x,rasengan3.body.position.y];


    rasenganDistX = narutosPos[0] - rasenganPos[0];
    rasengan2DistX = narutosPos[0] - rasengan2Pos[0];
    rasengan3DistX =narutosPos[0] - rasengan3Pos[0];

    rasenganDistY =  narutosPos[1] - rasenganPos[1];
    rasengan2DistY = narutosPos[1] - rasengan2Pos[1];
    rasengan3DistY =narutosPos[1] - rasengan3Pos[1];


    var distancias = [
        Math.round(Math.hypot(rasenganDistX, rasenganDistY)),
        Math.round(Math.hypot(rasengan2DistX, rasengan2DistY)),
        Math.round(Math.hypot(rasengan3DistX, rasengan3DistY)),
    ];

    var velocidad = [
        Math.round(
            Math.hypot(rasengan.body.velocity.x, rasengan.body.velocity.y)
        ),
        Math.round(
            Math.hypot(rasengan2.body.velocity.x, rasengan2.body.velocity.y)
        ),
        Math.round(
            Math.hypot(rasengan3.body.velocity.x, rasengan3.body.velocity.y)
        ),
    ];

statusAbajo=0;
statusArriba=0;
statusIzquierda=0;
statusDerecha=0;

    if (modoAuto == false) {
        if (modoAuto == false) {
            if (correr_izq.isDown && correr_arr.isDown) {
              narutos.body.velocity.x = -velocidadNaruto;
              narutos.body.velocity.y = -velocidadNaruto;
              statusIzquierda=1;
              statusArriba=1;
              correrL();
            } else if (correr_izq.isDown && correr_aba.isDown) {
              narutos.body.velocity.x = -velocidadNaruto;
              narutos.body.velocity.y = velocidadNaruto;
              statusIzquierda=1;
              statusAbajo=1;
              correrL();
            } else if (correr_der.isDown && correr_arr.isDown) {
              narutos.body.velocity.x = velocidadNaruto;
              narutos.body.velocity.y = -velocidadNaruto;
              statusDerecha=1;
              statusArriba=1;
              correrR();
            } else if (correr_der.isDown && correr_aba.isDown) {
              narutos.body.velocity.x = velocidadNaruto;
              narutos.body.velocity.y = velocidadNaruto;
              statusDerecha=1;
              statusAbajo=1;
              correrR();
            } else if (correr_izq.isDown) {
              narutos.body.velocity.x = -velocidadNaruto;
              statusIzquierda = 1;
             

              correrL();
            } else if (correr_der.isDown) {
              narutos.body.velocity.x = velocidadNaruto;
              statusDerecha = 1;

              correrR();

            } else if (correr_arr.isDown) {
              narutos.body.velocity.y = -velocidadNaruto;
              statusArriba = 1;
              correrU();
            } else if (correr_aba.isDown) {
              narutos.body.velocity.y = velocidadNaruto;
              statusAbajo = 1;
              correrD();

            }else {
                
               quieto()
                }
            if (distancias[0] < radio || distancias[1] < radio || distancias[2] < radio) {
                console.log(distancias[0], rasenganDistX, rasenganDistY, velocidad[0],distancias[1], rasengan2DistX, rasengan2DistY, velocidad[1],distancias[2], rasengan3DistX, rasengan3DistY, velocidad[2])
                datosEntrenamiento.push({
                    input: [distancias[0], rasenganDistX, rasenganDistY, velocidad[0],distancias[1], rasengan2DistX, rasengan2DistY, velocidad[1],distancias[2], rasengan3DistX, rasengan3DistY, velocidad[2]],
                    output: [statusArriba, statusAbajo, statusIzquierda, statusDerecha],
                });
            }
        }
        
        
    } else if (modoAuto == true) {
        decisiones = [0, 0, 0,0];
        if (distancias[0] < radio || distancias[1] < radio || distancias[2] < radio) {
            decisiones = datosDeEntrenamiento([distancias[0], rasenganDistX, rasenganDistY, velocidad[0], distancias[1], rasengan2DistX, rasengan2DistY, velocidad[1], distancias[2], rasengan3DistX, rasengan3DistY, velocidad[2]]);
            console.log(decisiones)
            if (decisiones[0]) { 50 
                narutos.body.velocity.y = -velocidadNaruto;
                correrU();
            }
            if (decisiones[1]) {  51 
                narutos.body.velocity.y = velocidadNaruto;
                correrD();
            }
            if (decisiones[2]) {  47
                narutos.body.velocity.x = -velocidadNaruto;
                correrL();
            }
            if (decisiones[3]) { 48
                narutos.body.velocity.x = velocidadNaruto;
                correrR();
            }
            
       }
        else {
            console.log("Estás a salvo");
            if (narutosPos[0] < w / 2) {
                narutos.body.velocity.x = velocidadNaruto;
            } else if (narutosPos[0] > w / 2) {
                narutos.body.velocity.x = -velocidadNaruto;
            }
            if (narutosPos[1] < h / 2) {
                narutos.body.velocity.y = velocidadNaruto;
            } else if (narutosPos[1] > h / 2) {
                narutos.body.velocity.y = -velocidadNaruto;
            }

        }
    }

}

function colisionShuriken(){

    pausa();
}
function render () {

    //debug helper
    game.debug.spriteInfo(rasengan, 32, 32);

}
