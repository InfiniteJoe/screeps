var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {


        if(!creep.spawning){
        //console.log('TEST1');
        if(creep.memory.reached){
            var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (creep) => (_.filter(creep.body,(body) => body.type == 'attack')).length >0});
            var closestStr =creep.pos.findClosestByRange(FIND_STRUCTURES,{filter: (str) => str.structureType != STRUCTURE_CONTROLLER && str.structureType != STRUCTURE_WALL});
            var spawn = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES,{filter: (str) => str.structureType == STRUCTURE_TOWER});
            console.log(closestHostile);
            if(closestHostile){
                //console.log(creep.name);
                //console.log('TEST2');
                if(creep.pos.getRangeTo(closestHostile) >2){
                    if(creep.rangedAttack(closestHostile) == ERR_NOT_IN_RANGE){
                    creep.moveTo(closestHostile);
                    if(creep.heal(creep))
                    creep.say('attacking');
                    }
                }else{
                    creep.say('retreating');
                    var t_direction=creep.pos.getDirectionTo(closestHostile);
                    if(creep.move((t_direction+4)%8)){
                        creep.move((t_direction+4)%8);
                    }
                    else if(creep.move((t_direction+3)%8)){
                    creep.move((t_direction+3)%8);}
                    else if(creep.move((t_direction+5)%8)){
                    creep.move((t_direction+5)%8);}

                }

            }else if(closestStr){

                if(creep.attack(closestStr) == ERR_NOT_IN_RANGE){
                    creep.moveTo(closestStr);
                    creep.say('attacking');
                }
            }
            else{
                //console.log('TEST3');
                creep.memory.reached=false;
                delete creep.memory.target;

            }

        }else if(!creep.memory.reached && !creep.memory.target){


            creep.memory.target=creep.memory.squad;
            //console.log('TEST4');
        }else{
            //console.log('TEST5');

            if(Memory.squads[creep.memory.squad].assembled){
                var target=Game.flags[creep.memory.target];
                //console.log(target);
                creep.moveTo(target,{costCallback: function(roomName, costMatrix) {
	                if(roomName == 'E79N43') {
                        for(var i=0;i<255;i++){
                            for(var j=0;j<255;j++){
                                costMatrix.set(i,j,255);
                            }
                        }
		            }
	            }

                });
                creep.moveTo(target,{ignoreDestructibleStructures: true});
                //if(creep.room.name = target.room.name){}
                if(creep.pos.inRangeTo(target,2)){
                    creep.memory.reached=true;
                }

            }else{
                creep.say('waiting for assembling')
                if(!Memory.squads[creep.memory.squad].members[creep.id]){
                    Memory.squads[creep.memory.squad].members[creep.id]=creep.id;
                    console.log('added');
                }

        }

        }

        }


    }
};

module.exports = roleAttacker;