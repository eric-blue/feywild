export default {
  // note that 0 indicates the default state state of the npc
  // moving to a new state will override the default state and can be saved to the gamestate
  0: {
    // based on the world's position, not the Tiled map texture's position
    position: [0, 0, 0],
    // an undefined route will cause the npc to stand still
    route: undefined, 
    enemy: false,
    dialogueFile: 'pickle-example.json',
    inventory: {},
    // common triggers:
    onAppear: () => {},
    onDialogueExit: () => console.log('ok nevermind then'),
    onDialogueStart: () => {},
    onDialogueEnd: () => console.log('goodbye'),
  },
  1: {
    dialogueFile: 'pickle-example-2.json',
  },
  2: {
    route: []
  }
};
