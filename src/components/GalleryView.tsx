import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllPokemonDetails, fetchPokemonTypes } from '../services/api';
import { Pokemon } from '../types/pokemon';
import styles from '../styles/GalleryView.module.css';

const GalleryView: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pokemonData, typeData] = await Promise.all([
          fetchAllPokemonDetails(151),
          fetchPokemonTypes(),
        ]);
        setPokemons(pokemonData);
        setFilteredPokemons(pokemonData);
        setTypes(typeData.map((t: any) => t.name));
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTypes.length === 0) {
      setFilteredPokemons(pokemons);
    } else {
      const filtered = pokemons.filter((pokemon) =>
        pokemon.types.some((type) => selectedTypes.includes(type.type.name))
      );
      setFilteredPokemons(filtered);
    }
  }, [selectedTypes, pokemons]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handlePokemonClick = (id: number) => {
    navigate(`/pokemon/${id}`, { state: { pokemons: filteredPokemons } });
  };

  if (loading) {
    return <div className={styles.loading}>Loading Gallery...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Pokémon Gallery</h1>
      
      <div className={styles.filters}>
        <h3>Filter by Type:</h3>
        <div className={styles.typeFilters}>
          {types.map((type) => (
            <button
              key={type}
              className={`${styles.typeButton} ${styles[type]} ${
                selectedTypes.includes(type) ? styles.active : ''
              }`}
              onClick={() => handleTypeToggle(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.results}>
        Showing {filteredPokemons.length} Pokémon
      </div>

      <div className={styles.gallery}>
        {filteredPokemons.map((pokemon) => (
          <div
            key={pokemon.id}
            className={styles.card}
            onClick={() => handlePokemonClick(pokemon.id)}
          >
            <div className={styles.imageContainer}>
              <img
                src={pokemon.sprites.other['official-artwork'].front_default}
                alt={pokemon.name}
              />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</span>
              <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
              <div className={styles.types}>
                {pokemon.types.map((type, index) => (
                  <span key={index} className={`${styles.type} ${styles[type.type.name]}`}>
                    {type.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryView;
