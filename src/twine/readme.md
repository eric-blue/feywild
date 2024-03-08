# Dialogue system
The dialogue system works by importing [compiled json files](./dialogue/) into a `Character`'s dialogue module. The compiled files are generated via a `bun` script, that takes a Twine `.twee` file as input. Currently this is a manual process.

# Steps to creating dialogue
- Open the Twine editor of your choice ([see below](#links)) and choose `Passage > New`
- Each 'passage' must have a `title` and some body `text`, this is used to link each passage to the next. Body `text` can be any number of lines of text
  - **note**: the first passage should have a title of `START`, the last `END`, and anytime a bit of dialogue exits early (that you want to return to later, ie. won't progress the scene/story) set the title to `EXIT`.
- To link passages together, add a list item (denoted by a line starting with `* `) and a double-bracketed bit of text, such as `* [[This will link to the next passage]]`
  - **note**: adding just one link item will be represented by the game as one frame of dialogue that continues to the next on enter/player action. Adding 2+ link items will be represented as branching dialogue. *Also, anything after the list items will be ignored.*

  **example**: single link item dialogue: 
  ```
  Hey, I'm just curious. Do you have a pickle? Do you have a pickle? Have a pickle, pickle, pickle?

  * [[next]]
  ```

  **example**: multi link item branching dialogue: 
  ```
  Hey, I'm just curious. Do you have a pickle? Do you have a pickle? Have a pickle, pickle, pickle?

  * [[No, and I wouldn't give it to you anyway. Bug me for a pickle some other day]]
  * [[Well, as a matter of fact I do. Oops! I guess I left it in my other shoe]]
  * [[No I don't. Go away! Don't come back another day!]]
  * [[No, but I think I know a man who does. He's right over there, he's covered in fuzz]]
  * [[Oh, Yeah sure, here you are. I keep my pickles all the time in this little jar]]
  ```

# Exporting the dialogue
- From Twine editor, go to `Build > Export as Twee` and save the file in `src/twine`
- Open a terminal and run `bun dialogue -- your-twee-filename.twee`
- You should see a new file created in `src/models/game-objects/**/dialogue`

# Importing dialogue into the scene
- When defining a `Character` (see [`1.ts`](../levels/1.ts) for an example), pass it in via the property `dialogueFile`. Example: `dialogueFile: "rebecca-1"` will reference the file `src/models/game-objects/dialogue/rebecca-1.json`.
- Next, optionally define the `Character`'s `onDialogueStart`, `onDialogueEnd`, and `onDialogueExit` methods

# Links
- [Twine docs](https://twinery.org/reference/en/)
- [Twine desktop editor](https://github.com/klembot/twinejs/releases) (select for your OS)
- [Twine browser editor](https://twinery.org/2/#/)