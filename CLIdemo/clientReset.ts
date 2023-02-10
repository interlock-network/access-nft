//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT RESET
//

// imports
import * as prompts from 'prompts';

// utility functions
import {
  returnToMain
} from "./utils";

async function reset() {

  try {

    console.log(`\nCredential reset feature coming soon.\n`);
            
    await returnToMain('return to main menu');

  } catch (error) {
    console.log(error)
  }
}

reset();
