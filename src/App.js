// Box and planes are individual 3D components
// Suspense is used to hold items in air when the window loads before they begin to fall due to their mass and gravitational effect
// useMemo shall be used to avoid expensive calculations each time it is rendered hence it is optimized. Check it out at https://reactjs.org/docs/hooks-reference.html#usememo
// useLoader is a hook which loads assets and suspends for easier fallback- and error-handling
// Physics brings in the Physics effect in the environment
// useBox, usePlane, useSphere and many more from cannon are used to import the models used in this project
// niceColors are used for beautification of objects
import * as THREE from 'three'
import { Box, Plane } from "@react-three/drei";
import React, { Suspense, useMemo }  from "react";
import { Canvas, useLoader } from "react-three-fiber";
import { Physics, useBox, usePlane, useSphere } from "@react-three/cannon";
import niceColors from 'nice-color-palettes';
import "./index.css";

// It allows you to input a color as an argument
// The material used will have been built by a mesh material
// Remember, you can still add other attributes in the object created
// We won't add it's mass since itwill begin to fall
function PhyPlane({ color, ...props }) {
  const [ref] = usePlane(() => ({ ...props }));

  return (
      <Plane args={[1000, 1000]} ref={ref}>
        <meshStandardMaterial color={color} />
      </Plane>
  );
}

// It has a mass so that it will always be under a gravitational effect to fall
// We have put in some trigger events which will cause some action to occur; that is on-click
// They shall be built out of a mesh material
function PhyBox(props) {
  const [ref, api] = useBox(() => ({ args: [1, 1, 1], mass: 1, ...props }));

  return (
      <Box
          args={[1, 1, 1]}
          ref={ref}
          onClick={() =>

              // This shoots the object when clicked on
               api.applyImpulse([0, 5, -10], [1, 1, 1])
              &&

              // This makes the object fly upwards when clicked on

               api.velocity.set(0, 2, 0)

          }
      >
        <meshNormalMaterial />
      </Box>
  );
}

// This  is used to create spherical objects in the app
// 'carbon_normal.jpg' is used as a texture loader for each one of them
// The mass is 1, while the start position; that is, when the app is started is obtained randomly in the x and y axis
// We shall use some blocks of code to setup the color of each sphere so that each sphere may look differently
function InstancedSpheres({ number }) {
  const map = useLoader(THREE.TextureLoader, '/carbon_normal.jpg')
  const [ref] = useSphere(index => ({
    mass: 1,
    position: [Math.random() - 0.5, Math.random() - 0.5, index * 4],
    args:1
  }))
  const colors = useMemo(() => {
    const array = new Float32Array(number * 3)
    const color = new THREE.Color()
    for (let i = 0; i < number; i++)
      color
          .set(niceColors[17][Math.floor(Math.random() * 5)])
          .convertSRGBToLinear()
          .toArray(array, i * 3)
    return array
  }, [number])
  return (
      <instancedMesh ref={ref} castShadow receiveShadow args={[null, null, number]}>
        <sphereBufferGeometry attach="geometry" args={[1, 16, 16]}>
          <instancedBufferAttribute attachObject={['attributes', 'color']} args={[colors, 3]} />
        </sphereBufferGeometry>
        <meshPhongMaterial
            attach="material"
            vertexColors={THREE.VertexColors}
            normalMap={map}
            normalScale={[1, 1]}
            normalMap-wrapS={THREE.RepeatWrapping}
            normalMap-wrapT={THREE.RepeatWrapping}
            normalMap-repeat={[10, 10]}
        />
      </instancedMesh>
  )
}

function App() {
    return (

        // Canvas holds all our items and scene
        // Set camera position and focus
        <Canvas camera={{ position: [0, 0, 0], near: 0.1, far: 1000 }}>

            // Set gravity
            // All items we want to see the effect of gravity on them shall be inside the Physics tags
            // These include the planes and boxes and any other models
            // Four planes are created which shall hold the contents as a platform
            <Physics gravity={[0, -10, 0]} size={100} tolerance={0.001} iterations={5} broadphase={"Naive"} step={1/60} shouldInvalidate={true} children allowSleep={false} axisIndex={0} defaultContactMaterial={1e6}>
                <PhyPlane
                    color={niceColors[17][5]}
                    position={[0, -2, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                />
                <PhyPlane color={niceColors[17][2]} position={[0, 0, -10]} />
                <PhyPlane color={niceColors[17][3]} position={[-6, 0, -10]} rotation={[0, 2, 0]} />
                <PhyPlane color={niceColors[17][1]} position={[6, 0, -10]} rotation={[0, -2, 0]} />

                // Three objects are placed in different positions in the x, y, and z axis
                <PhyBox position={[2, 0, -5]} />
                <PhyBox position={[0, 0, -5]} />
                <PhyBox position={[-2, 0, -5]} />
                <Suspense fallback={null}>
                    <InstancedSpheres number={10} />
                </Suspense>
            </Physics>

            // This is for provision of ambient lighting in the scene
            <ambientLight intensity={0.3} />

            // We have added some pointLight here at the position showed
            <pointLight intensity={0.8} position={[5, 0, 5]} />

            // Apart from ambient light and point light, you can add others such as fog
        </Canvas>
    );
}

export default App;
