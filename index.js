const fs = require('fs').promises
const https = require('https')

function getPokemonList() {
  return fs.readFile('./pokemon_list.json', 'utf-8')
    .then((content) => {
      const data = JSON.parse(content)
      return data.pokemons
    })
    .catch((error) => {
      console.error('Erro ao ler o arquivo JSON:', error)
      return []
    })
}

function searchPokemon(name) {
  return getPokemonList()
    .then((pokemonList) => {
      if (pokemonList.includes(name)) {
        const pokemonName = name.toLowerCase()
        return new Promise((resolve, reject) => {
          const options = {
            hostname: 'pokeapi.co',
            path: `/api/v2/pokemon/${pokemonName}`,
            method: 'GET'
          }
          const req = https.request(options, (res) => {
            let data = ''
            res.on('data', (chunk) => {
              data += chunk
            })
            res.on('end', () => {
                const pokemon = JSON.parse(data)
                const { name, types } = pokemon
                const pokemonType = types.map((type) => type.type.name).join(', ')
                resolve({ name, type: pokemonType })
            })
          })
          req.on('error', (error) => {
            reject(`Erro ao consultar a API de pokémons: ${error.message}`)
          })
          req.end()
        })
      } else {
        return 'Pokémon não encontrado na lista'
      }
    })
    .catch(() => {
      throw new Error('Erro ao processar a resposta da API de pokémons')
    })
}

searchPokemon("Charizard")
  .then((result) => {
    console.log(`Nome do Pokemon: ${result.name} 
Tipos do Pokemon: ${result.type}
`)
  })
  .catch((error) => {
    console.error(error)
  })