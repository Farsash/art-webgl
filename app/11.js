const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0';
document.body.appendChild(stats.domElement);
scene.background = new THREE.Color( 0x222222 );

let T_loader = new THREE.TextureLoader();

const contril_sis = true;
var controls;

if (contril_sis){
    controls = new THREE.OrbitControls( camera );
} else {
    camera.position.y = 30;
    camera.position.z = - 220;
    camera.lookAt(new THREE.Vector3(0,0,0));
}

// 
//

function LoadVertex( arr ){

    let positions = [];
    let uvs = [];

    console.log(arr[0]);
  
    arr.forEach(function(e) {
      positions.push(e.attributes.position.array);
      uvs.push(e.attributes.uv.array);
    });

    return { "position": positions, "uv": uvs};

}

const vertex_pos = new LoadVertex([ new THREE.PlaneBufferGeometry( 500, 500, 120, 120 ) ]);
console.log(vertex_pos);

var vertexShader = `
  precision highp float;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;

  attribute vec3 position;
  attribute vec2 uv;

  uniform float time;
  uniform sampler2D texture;

  varying vec2 vUv;

  void main() {
    vUv = uv;

    float step = 1. / 12.;

    vec2 runUVs = vec2(uv.x * step + (time * step ) , uv.y);
    
    vec4 run = texture2D( texture, runUVs );
    vec4 cloude = texture2D( texture, vec2(uv.x * step, uv.y + time / 2.) );
    float pos = mix(run.r, cloude.r, run.r);

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vec3(position.x , position.y, position.z + (pos * 25. )  ), 1.0 );

    gl_PointSize = pos;
  }
`;

var fragmentShader = `

  precision highp float;

  uniform sampler2D mask;
  uniform sampler2D texture;
  varying vec2 vUv;
  uniform float time;

  void main() { 
    float step = 1. / 12.;
    vec2 runUVs = vec2(vUv.x * step + (time * step ) , vUv.y);
    vec4 run = texture2D( texture, runUVs );
    vec3 color = vec3(1.0, 0.2, 0.2);
    if (run.r < 0.2){
      discard; 
    }    
    gl_FragColor = vec4(color, texture2D( mask, gl_PointCoord ).a);   

  }

`;

console.log(vertex_pos.position);
console.log(vertex_pos.uv);


var material = new THREE.RawShaderMaterial({    
  uniforms: { 
    time: { type: "f", value: 0.0 }, 
    mask: { value: new THREE.TextureLoader().load( "./asset/crl.png" ) },
    texture: { value: new THREE.TextureLoader().load( "./asset/run.png", function(e){ e.wrapS = e.wrapT = THREE.RepeatWrapping } ) } 
}, 
  vertexShader: vertexShader, 
  fragmentShader: fragmentShader,
  transparent: true
});

var geometry = new THREE.BufferGeometry();

geometry.addAttribute( 'position', new THREE.BufferAttribute( vertex_pos.position[0], 3 ) );
geometry.addAttribute( 'uv', new THREE.BufferAttribute( vertex_pos.uv[0], 2 ) );
var mesh = new THREE.Points( geometry, material );

scene.add( mesh );

let k = 0;

function animate() {

    k += 0.5;
    
    if (contril_sis){
        controls.update();
    }

    if (k % 2 == 0) {
      material.uniforms.time.value += 1.0;
      console.log(material.uniforms.time.value);
    }
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    stats.update();

}

window.addEventListener( 'resize', onWindowResize, false );


function onWindowResize() {
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


animate();