//
// INTERLOCK NETWORK & ALEPH ZERO
// PSP34 UNIVERSAL ACCESS NFT - CLIENT RESET
//

// imports
import * as prompts from 'prompts';

async function reset() {

  try {

    console.log(`\nCredential reset feature coming soon.\n`);
            
    (async () => {

      var choice = await prompts({
         type: 'select',
        name: 'return',
         message: 'Now choose one of the following options:',
        choices: [{ title: 'return to main menu', value: 'return' }]
      });

      process.send('done');
      process.exit();
    })();

  } catch (error) {
    console.log(error)
  }
}

reset();
