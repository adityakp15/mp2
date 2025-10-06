import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllPokemonDetails } from '../services/api';
import { Pokemon } from '../types/pokemon';
import styles from '../styles/ListView.module.css';

const ListView: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'id'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        const data = await fetchAllPokemonDetails(151);
        setPokemons(data);
        setFilteredPokemons(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokemon:', error);
        setLoading(false);
      }
    };
    loadPokemons();
  }, []);

  useEffect(() => {
    let filtered = pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = a.id - b.id;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPokemons(filtered);
  }, [searchQuery, sortBy, sortOrder, pokemons]);

  const handlePokemonClick = (id: number) => {
    navigate(`/pokemon/${id}`, { state: { pokemons: filteredPokemons } });
  };

  if (loading) {
    return <div className={styles.loading}>Loading Pokémon...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>I Choose You!</h1>
      
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchBar}
        />
        
        <div className={styles.sortControls}>
          <label>
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'id')}>
              <option value="id">ID</option>
              <option value="name">Name</option>
            </select>
          </label>
          
          <label>
            Order:
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.results}>
        Found {filteredPokemons.length} Pokémon
      </div>

      <div className={styles.list}>
        {filteredPokemons.map((pokemon) => (
          <div
            key={pokemon.id}
            className={styles.listItem}
            onClick={() => handlePokemonClick(pokemon.id)}
          >
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              className={styles.sprite}
            />
            <div className={styles.info}>
              <h3>#{pokemon.id.toString().padStart(3, '0')}</h3>
              <h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
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

export default ListView;
