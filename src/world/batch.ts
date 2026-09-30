import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Bake static mesh parts into material batches; preserve animated child roots. */
export function batchStatic(root:T.Object3D,exclude=new Set<T.Object3D>()) {
  root.updateWorldMatrix(true,true);
  const inverse=root.matrixWorld.clone().invert();
  const groups=new Map<T.Material,{geometry:T.BufferGeometry[];sources:T.Mesh[]}>();
  function collect(object:T.Object3D) {
    if(exclude.has(object))return;
    if(object instanceof T.Mesh&&!(object instanceof T.InstancedMesh)&&!Array.isArray(object.material)) {
      let group=groups.get(object.material);
      if(!group){group={geometry:[],sources:[]};groups.set(object.material,group);}
      const geometry=object.geometry.clone();geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld));
      group.geometry.push(geometry);group.sources.push(object);
    }
    for(const child of object.children)collect(child);
  }
  for(const child of root.children)collect(child);
  for(const [material,group] of groups) {
    if(group.geometry.length>1){const merged=mergeGeometries(group.geometry);if(merged){for(const source of group.sources)source.removeFromParent();root.add(new T.Mesh(merged,material));}}
    for(const geometry of group.geometry)geometry.dispose();
  }
}
