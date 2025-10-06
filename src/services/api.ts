import axios from 'axios';
import { Pokemon } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const api = axios.create({
  baseURL: BASE_URL,
});

export const fetchPokemonList = async (limit: number = 151) => {
  const response = await api.get(`/pokemon?limit=${limit}`);
  const results = response.data.results.map((pokemon: any, index: number) => ({
    ...pokemon,
    id: index + 1,
  }));
  return results;
};

export const fetchPokemonDetails = async (id: number): Promise<Pokemon> => {
  const response = await api.get(`/pokemon/${id}`);
  return response.data;
};

export const fetchAllPokemonDetails = async (limit: number = 151) => {
  const list = await fetchPokemonList(limit);
  const promises = list.map((pokemon: any) => fetchPokemonDetails(pokemon.id));
  return Promise.all(promises);
};

export const fetchPokemonTypes = async () => {
  const response = await api.get('/type');
  return response.data.results.filter((type: any) => 
    !['unknown', 'shadow'].includes(type.name)
  );
};
