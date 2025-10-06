import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchPokemonDetails } from '../services/api';
import { Pokemon } from '../types/pokemon';
import styles from '../styles/DetailView.module.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const pokemonList = location.state?.pokemons || [];

  useEffect(() => {
    const loadPokemon = async () => {
      if (id) {
        try {
          setLoading(true);
          const data = await fetchPokemonDetails(parseInt(id));
          setPokemon(data);
          
          if (pokemonList.length > 0) {
            const index = pokemonList.findIndex((p: Pokemon) => p.id === parseInt(id));
            if (index !== -1) setCurrentIndex(index);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching Pokemon details:', error);
          setLoading(false);
        }
      }
    };
    loadPokemon();
  }, [id]);

  const handlePrevious = () => {
    if (pokemonList.length > 0 && currentIndex > 0) {
      const prevPokemon = pokemonList[currentIndex - 1];
      navigate(`/pokemon/${prevPokemon.id}`, { state: { pokemons: pokemonList } });
    }
  };

  const handleNext = () => {
    if (pokemonList.length > 0 && currentIndex < pokemonList.length - 1) {
      const nextPokemon = pokemonList[currentIndex + 1];
      navigate(`/pokemon/${nextPokemon.id}`, { state: { pokemons: pokemonList } });
    }
  };

  if (loading || !pokemon) {
    return <div className={styles.loading}>Loading Pokémon Details...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0 || pokemonList.length === 0}
          className={styles.navButton}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === pokemonList.length - 1 || pokemonList.length === 0}
          className={styles.navButton}
        >
          Next →
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
          <span className={styles.id}>#{pokemon.id.toString().padStart(3, '0')}</span>
        </div>

        <div className={styles.mainInfo}>
          <div className={styles.imageSection}>
            <img
              src={pokemon.sprites.other['official-artwork'].front_default}
              alt={pokemon.name}
              className={styles.mainImage}
            />
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.types}>
              {pokemon.types.map((type, index) => (
                <span key={index} className={`${styles.type} ${styles[type.type.name]}`}>
                  {type.type.name}
                </span>
              ))}
            </div>

            <div className={styles.measurements}>
              <div className={styles.measurement}>
                <span className={styles.label}>Height</span>
                <span className={styles.value}>{pokemon.height / 10} m</span>
              </div>
              <div className={styles.measurement}>
                <span className={styles.label}>Weight</span>
                <span className={styles.value}>{pokemon.weight / 10} kg</span>
              </div>
            </div>

            <div className={styles.abilities}>
              <h3>Abilities</h3>
              <div className={styles.abilityList}>
                {pokemon.abilities.map((ability, index) => (
                  <span key={index} className={styles.ability}>
                    {ability.ability.name.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.stats}>
              <h3>Base Stats</h3>
              {pokemon.stats.map((stat, index) => (
                <div key={index} className={styles.stat}>
                  <span className={styles.statName}>
                    {stat.stat.name.replace('-', ' ').toUpperCase()}
                  </span>
                  <div className={styles.statBar}>
                    <div
                      className={styles.statFill}
                      style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                    />
                  </div>
                  <span className={styles.statValue}>{stat.base_stat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
