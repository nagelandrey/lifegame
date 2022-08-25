<template>
  <div class="field-wrapper">
    <div class="aside">
      <button class="button" @click="update">Update</button>
      <button class="button" @click="reset">Reset</button>
      <button class="button" @click="start">Start</button>
      <button class="button" @click="stop">Stop</button>
      <router-link to="/fractals" class="link">fractals</router-link>
    </div>
    <div class="field-container">
      <div class="field" @mousedown="onFieldClick" @contextmenu.prevent>
        <div class="row"
             :key="row"
             v-for="row in field"
        >
          <div
              class="cell"
              :key="entity"
              v-for="entity in row"
              :class="entity.class"
              :style="cellStyle"
              :data-x="entity.x"
              :data-y="entity.y"
          >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, reactive} from "vue";
import {Entity} from "@/models/Entity";
import {Entities} from "@/models/Entities";
import {IndexNeighbours} from "@/models/IndexNeighbour";

interface ClickEvent extends MouseEvent {
  target: HTMLElement;
}

export default defineComponent({
  name: 'MainField',
  props: {
    horizontalCount: {
      type: Number,
      default: 70,
    },
    verticalCount: {
      type: Number,
      default: 70,
    },
  },
  setup(props) {
    const UPDATE_TIME = 100;
    const fieldWidth = 700;
    const fieldHeight = 600;
    const entitiesValues = {
      VOID: 0,
      ENTITY: 1,
    };
    const ENTITIES_CLASSES = ["white", "black"];

    const getNewTypeEntity = (newType: number, y: number, x: number): Entity => {
      return {
        value: newType,
        class: ENTITIES_CLASSES[newType],
        x: x,
        y: y,
      }
    };

    const entities = reactive<Entities>({value: []});
    for (let i = 0; i < props.verticalCount; i++) {
      entities.value.push([]);
      for (let j = 0; j < props.horizontalCount; j++) {
        const entityTemplate: Entity = getNewTypeEntity(0, i, j);
        entities.value[i].push(entityTemplate);
      }
    }

    const field = computed({
      get() {
        return entities.value;
      },
      set(newEntities) {
        entities.value = newEntities;
      }
    });

    const reset = () => {
      for (let i = 0; i < props.verticalCount; i++) {
        for (let j = 0; j < props.horizontalCount; j++) {
          entities.value[i][j] = (getNewTypeEntity(0, i, j));
        }
      }
    }

    // from top left to bottom right
    let indexes: IndexNeighbours[] = [];
    let countNeighborhoods = 0;

    const update = () => {
      const templateEntities = JSON.parse(JSON.stringify(entities.value));

      for (let i = 0; i < props.verticalCount; i++) {
        for (let j = 0; j < props.horizontalCount; j++) {
          indexes[0] = {
            x: j > 0 ? j - 1 : props.horizontalCount - 1,
            y: i > 0 ? i - 1 : props.verticalCount - 1,
          };
          indexes[1] = {
            x: j,
            y: i > 0 ? i - 1 : props.verticalCount - 1,
          };
          indexes[2] = {
            x: j < props.horizontalCount - 1 ? j + 1 : 0,
            y: i > 0 ? i - 1 : props.verticalCount - 1,
          };
          indexes[3] = {
            x: j > 0 ? j - 1 : props.horizontalCount - 1,
            y: i,
          };
          indexes[4] = {
            x: j,
            y: i,
          };
          indexes[5] = {
            x: j < props.horizontalCount - 1 ? j + 1 : 0,
            y: i,
          };
          indexes[6] = {
            x: j > 0 ? j - 1 : props.horizontalCount - 1,
            y: i < props.verticalCount - 1 ? i + 1 : 0,
          };
          indexes[7] = {
            x: j,
            y: i < props.verticalCount - 1 ? i + 1 : 0,
          };
          indexes[8] = {
            x: j < props.horizontalCount - 1 ? j + 1 : 0,
            y: i < props.verticalCount - 1 ? i + 1 : 0,
          };
          countNeighborhoods = 0;
          for (let k = 0; k < indexes.length; k++) {
            if (indexes[k].y === i && indexes[k].x === j) {
              continue;
            }
            if (templateEntities[indexes[k].y][indexes[k].x].value === entitiesValues.ENTITY) {
              countNeighborhoods++;
            }
          }
          if (countNeighborhoods < 2 || countNeighborhoods > 3) {
            entities.value[i][j] = getNewTypeEntity(entitiesValues.VOID, i, j);
          } else if (countNeighborhoods === 2 && entities.value[i][j].value === entitiesValues.ENTITY) {
            entities.value[i][j] = getNewTypeEntity(entitiesValues.ENTITY, i, j);
          } else if (countNeighborhoods === 3) {
            entities.value[i][j] = getNewTypeEntity(entitiesValues.ENTITY, i, j);
          }
        }
      }
    };

    const getWidth = () => {
      return String(fieldWidth / props.verticalCount) + "px";
    };

    const getHeight = () => {
      return String(fieldHeight / props.horizontalCount) + "px";
    };

    const cellStyle = reactive({
      width: getWidth(),
      height: getHeight()
    });

    reset();
    let updateInterval = setInterval(() => {
    }, 10000);
    let isAutoUpdate = false;

    const start = () => {
      if (isAutoUpdate) {
        return;
      }
      isAutoUpdate = true;
      updateInterval = setInterval(update, UPDATE_TIME);
    };

    const stop = () => {
      if (!isAutoUpdate) {
        return;
      }
      isAutoUpdate = false;
      clearInterval(updateInterval);
    };

    const onFieldClick = (event: ClickEvent) => {
      if (!event.target.dataset.x || !event.target.dataset.y) {
        return;
      }
      const x = Number(event.target.dataset.x);
      const y = Number(event.target.dataset.y);
      const entity = event.button === 0 ? entitiesValues.ENTITY : entitiesValues.VOID;
      entities.value[y][x] = getNewTypeEntity(entity, y, x);
    };

    return {
      cellStyle,
      field,

      onFieldClick,
      start,
      stop,
      reset,
      update,
    }
  },
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.field-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0;
}

.aside {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-basis: 25%;
  height: 80vh;
  margin: 5px;
  padding: 0;
  border: 1px solid #CECECE;
  border-radius: 10px;
  box-shadow: 2px 2px 5px #CECECE;
}

.button {
  margin: 2px;
  padding: 5px 10px;
  border: 1px solid #CECECE;
  background: #EEEEEE;
  border-radius: 5px;
  font-weight: 200;
  box-shadow: 0 0 0 #CECECE;
  transition: all 0.15s ease-in-out;
}

.button:hover {
  box-shadow: 1px 1px 3px #CECECE;
  background: #a5e7c7;
}

.field-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(66, 185, 131, 0.75);
  flex-basis: 75%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.field {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  justify-content: center;
  width: auto;
  height: auto;
}

.row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: left;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
}

.cell {
  margin: 0;
  padding: 0;
  border: 1px solid #333333;
  color: red;
}

.white {
  background: #EEEEEE;
}

.black {
  background: #050303;
}

</style>
