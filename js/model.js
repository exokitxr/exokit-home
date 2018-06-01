THREE.Model = (() => {
  const MODEL_SCALE = 1.6;

  const localVector = new THREE.Vector3();
  const localVector2 = new THREE.Vector3();
  const localQuaternion = new THREE.Quaternion();
  const localQuaternion2 = new THREE.Quaternion();
  const localBox = new THREE.Box3();

  const _bindModel = skinnedMesh => {
    const {skeleton} = skinnedMesh;
    const {bones} = skeleton;
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];
      localVector.set(0, 0, 1)
        .applyQuaternion(bone.quaternion);
      new THREE.Plane().setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0).applyQuaternion(bone.quaternion),
        new THREE.Vector3(0, 0, 0)
      ).projectPoint(localVector, localVector2);
      localVector2.normalize();
      bone.twist = Math.acos(localVector2.dot(localVector.set(0, 0, 1)));
    }

    const ik = new THREE.IK();

    const head = bones.find(bone => /^(?:head)|(?:Head)$/.test(bone.name));
    const chest = bones.find(bone => /^(?:chest)|(?:Chest|Spine2)$/.test(bone.name));
    const handL = bones.find(bone => /^(?:handL)|(?:HandL|LeftHand|Left_wrist)$/.test(bone.name));
    const shoulderL = bones.find(bone => /^(?:clavicleL)|(?:ShoulderL|LeftShoulder|Left_shoulder)$/.test(bone.name));
    const handR = bones.find(bone => /^(?:handR)|(?:HandR|RightHand|Right_wrist)$/.test(bone.name));
    const shoulderR = bones.find(bone => /^(?:clavicleR)|(?:ShoulderR|RightShoulder|Right_shoulder)$/.test(bone.name));
    const kneeL = bones.find(bone => /^(?:shinR)|(?:Lower_legL|LeftLeg|Left_knee)$/.test(bone.name));
    const thighL = bones.find(bone => /^(?:thighL)|(?:Upper_legL|LeftUpLeg|Left_leg)$/.test(bone.name));
    const kneeR = bones.find(bone => /^(?:shinR)|(?:Lower_legR|RightLeg|Right_knee)$/.test(bone.name));
    const thighR = bones.find(bone => /^(?:thighR)|(?:Upper_legR|RightUpLeg|Right_leg)$/.test(bone.name));

    if (!(head && chest && shoulderL && handR && shoulderR && kneeL && thighL && kneeR && thighR)) {
      console.warn('did not load', {
        head,
        chest,
        shoulderL,
        handR,
        shoulderR,
        kneeL,
        thighL,
        kneeR,
        thighR,
      }, skinnedMesh);
      throw new Error('failed to load');
    }

    const invertedKnee = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().setFromRotationMatrix(kneeL.matrixWorld)).z < 0;

    const _getBoneList = (startBone, endBone) => {
      const list = [];
      for (let bone = startBone; bone && bone !== endBone; bone = bone.parent) {
        list.push(bone);
      }
      list.reverse();
      return list;
    };
    const _addBone = (startBone, endBone, angle, limb, end) => {
      const chain = new THREE.IKChain();
      let endJoint = null;
      if (startBone.isIKJoint) {
        endJoint = startBone;
        startBone = startBone.bone.parent;
      }
      const list = _getBoneList(startBone, endBone);

      // console.log('bone list', startBone.name, endBone.name, list.map(bone => bone.name));
      for (let i = 0; i < list.length; i++) {
        const bone = list[i];

        const joint = new THREE.IKJoint(bone, {
          constraints: [
            new THREE.IKBallConstraint(angle),
          ],
        });
        joint.limb = i === 0 && limb;
        const target = (end && i === (list.length - 1)) ? camera : null;
        chain.add(joint, {target});
      }

      if (endJoint) {
        chain.add(endJoint);
      }

      return chain;
    };
    const _fixBones = (startBone, endBone, factor) => {
      const list = _getBoneList(startBone, endBone);

      let acc = Math.PI/4;
      for (let i = 0; i < list.length; i++) {
        const bone = list[i];
        const oldQuaternion = bone.quaternion.clone();
          bone.quaternion.multiply(
            new THREE.Quaternion().setFromRotationMatrix(
              new THREE.Matrix4().lookAt(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(0, 0, 1)
              )
            )
          );
        acc += bone.twist;
        bone.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), factor * acc));

        reverts.push(() => {
          bone.quaternion.copy(oldQuaternion);
        });

        const parentOldMatrixWorld = bone.matrixWorld.clone();
        const parentOldatrixWorldInverse = new THREE.Matrix4().getInverse(parentOldMatrixWorld);

        bone.matrix.compose(bone.position, bone.quaternion, bone.scale);
        bone.matrixWorld.multiplyMatrices(bone.parent ? bone.parent.matrixWorld : new THREE.Matrix4(), bone.matrix);

        const parentNewMatrixWorld = bone.matrixWorld.clone();
        const parentNewMatrixWorldInverse = new THREE.Matrix4().getInverse(parentNewMatrixWorld);

        const _transformChild = child => {
          child.matrix
            .premultiply(parentOldMatrixWorld)
            .premultiply(parentNewMatrixWorldInverse);
          child.matrix.decompose(child.position, child.quaternion, child.scale);
          // child.updateMatrixWorld();
        };

        if (i !== list.length - 1) {
          for (let j = 0; j < bone.children.length; j++) {
            const child = bone.children[j];
            const oldMatrix = child.matrix.clone();
            _transformChild(child);

            reverts.push(() => {
              child.matrix.copy(oldMatrix);
              child.matrix.decompose(child.position, child.quaternion, child.scale);
              // child.updateMatrixWorld();
            });
          }
        }
      }
    };

    ik.add(_addBone(head, chest, 160, false, true));

    ik.add(_addBone(handL, shoulderL, 120, true, true));
    ik.add(_addBone(handR, shoulderR, 120, true, true));

    // const helper = new THREE.IKHelper(ik);
    // scene.add(helper);

    let reverts = [];
    const initialKneeLQuaternion = kneeL.quaternion.clone();
    const initialThighLQuaternion = thighL.quaternion.clone();
    const initialKneeRQuaternion = kneeR.quaternion.clone();
    const initialThighRQuaternion = thighR.quaternion.clone();
    return () => {
      if (reverts.length > 0) {
        for (let i = 0; i < reverts.length; i++) {
          reverts[i]();
        }
        reverts.length = 0;
      }

      ik.solve();

      _fixBones(handL, shoulderL, -1);
      _fixBones(handR, shoulderR, 1);

      const rate = 1200;
      const f = (Date.now() % rate) / rate;
      kneeL.quaternion.copy(initialKneeLQuaternion)
        .slerp(
          localQuaternion.copy(initialKneeLQuaternion)
            .multiply(
              localQuaternion2
                .setFromUnitVectors(
                  localVector.set(0, 0, -1),
                  localVector2.set(0, invertedKnee ? -1 : 1, 0)
                )
            ),
          ((Math.sin((f + 0.1) * Math.PI * 2) + 1) / 2) * 0.6
        );
      thighL.quaternion.copy(initialThighLQuaternion)
        .slerp(
          localQuaternion.copy(initialThighLQuaternion)
            .multiply(
              localQuaternion2
                .setFromUnitVectors(
                  localVector.set(0, 0, -1),
                  localVector2.set(0, invertedKnee ? 1 : -1, 0)
                )
            ),
          0.5 + ((Math.sin(f * Math.PI * 2) - 1) / 2) * 0.6
        );
      kneeR.quaternion.copy(initialKneeRQuaternion)
        .slerp(
          localQuaternion.copy(initialKneeRQuaternion)
            .multiply(
              localQuaternion2
                .setFromUnitVectors(
                  localVector.set(0, 0, -1),
                  localVector2.set(0, invertedKnee ? -1 : 1, 0)
                )
            ),
          ((Math.sin((f + 0.1 + 0.5) * Math.PI * 2) + 1) / 2) * 0.6
        );
      thighR.quaternion.copy(initialThighRQuaternion)
        .slerp(
          localQuaternion.copy(initialThighRQuaternion)
            .multiply(
              localQuaternion2
                .setFromUnitVectors(
                  localVector.set(0, 0, -1),
                  localVector2.set(0, invertedKnee ? 1 : -1, 0)
                )
            ),
          0.5 + ((Math.sin((f + 0.5) * Math.PI * 2) - 1) / 2) * 0.6
        );
    };
  };

  const _handleModelLoad = object => {
    const skinnedMeshes = (() => {
      const _findSkinMeshes = children => {
        let skinnedMeshes = null;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.isSkinnedMesh) {
            if (!skinnedMeshes) {
              skinnedMeshes = [];
            }
            skinnedMeshes.push(child);
          }
        }
        if (skinnedMeshes) {
          return skinnedMeshes;
        } else {
          for (let i = 0; i < children.length; i++) {
            const result = _recurse(children[i].children);
            if (result) {
              return result;
            }
          };
          return null;
        }
      };

      if (object.isGroup) {
        return _findSkinMeshes(object.children);
      } else if (object.isSkinnedMesh) {
        return [object];
      } else if (object.scene) {
        return _findSkinMeshes(object.scene.children);
      } else {
        return null;
      }
    })();
    if (!skinnedMeshes) {
      console.warn('failed to find skinned meshes', object);
      return;
    }

    localBox.setFromObject(object).getSize(localVector);
    const scale = Math.max(localVector.x, localVector.y, localVector.z);

    object.scale.multiplyScalar(MODEL_SCALE / scale);
    object.updateMatrixWorld();

    const ticks = skinnedMeshes.map(skinnedMesh => _bindModel(skinnedMesh));
    return {
      animate() {
        for (let i = 0; i < ticks.length; i++) {
          ticks[i]();
        }
      },
    };
  };
  return {
    FBX(u) {
      return new Promise((accept, reject) => {
        new THREE.FBXLoader().load(u, object => { // load
          const {animate} = _handleModelLoad(object);
          object.animate = animate;

          accept(object);
        }, () => { // progress
          // nothing
        }, err => { // error
          reject(err);
        });
      });
    }
  };
})();
