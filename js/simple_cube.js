<script src="{{site.url}}/js/three.js"></script>

<script>
var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000),
    renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth / 2, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1, 1, 1),
    material = new THREE.MeshNormalMaterial(),
    cube = new THREE.Mesh(geometry, material);

scene.add(cube);
camera.position.z = 5;

// actual render
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}
render();
</script>
