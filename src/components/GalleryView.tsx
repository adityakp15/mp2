import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllPokemonDetails, fetchPokemonDetails } from '../services/api';
import { Pokemon } from '../types/pokemon';
import styles from '../styles/GalleryView.module.css';

const GalleryView: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredList, setFilteredList] = useState<Pokemon[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<string>('all');
  const [availableTypes] = useState<string[]>([
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(72); 

  const generations = {
    'all': { name: 'All Generations', min: 1, max: 1025 },
    'gen1': { name: 'Gen 1 (Kanto)', min: 1, max: 151 },
    'gen2': { name: 'Gen 2 (Johto)', min: 152, max: 251 },
    'gen3': { name: 'Gen 3 (Hoenn)', min: 252, max: 386 },
    'gen4': { name: 'Gen 4 (Sinnoh)', min: 387, max: 493 },
    'gen5': { name: 'Gen 5 (Unova)', min: 494, max: 649 },
    'gen6': { name: 'Gen 6 (Kalos)', min: 650, max: 721 },
    'gen7': { name: 'Gen 7 (Alola)', min: 722, max: 809 },
    'gen8': { name: 'Gen 8 (Galar)', min: 810, max: 905 },
    'gen9': { name: 'Gen 9 (Paldea)', min: 906, max: 1025 }
  };

  useEffect(() => {
    fetchPokemon();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [selectedTypes, selectedGeneration, pokemonList]);

  const fetchPokemon = async () => {
    try {
      const pokemonPromises = [];
      for (let i = 1; i <= 1025; i++) {
        pokemonPromises.push(fetchPokemonDetails(i));
      }
      
      const detailedPokemon = await Promise.all(pokemonPromises);
      setPokemonList(detailedPokemon);
      setFilteredList(detailedPokemon);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pokemon:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...pokemonList];

    if (selectedGeneration !== 'all') {
      const genRange = generations[selectedGeneration as keyof typeof generations];
      filtered = filtered.filter(
        (pokemon) => pokemon.id >= genRange.min && pokemon.id <= genRange.max
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter((pokemon) =>
        pokemon.types.some((t) => selectedTypes.includes(t.type.name))
      );
    }

    setFilteredList(filtered);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return <div className={styles.loading}>Loading Gallery...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Pokédex Gallery</h1>
      
      <div className={styles.filtersContainer}>
        {/* Generation Filter */}
        <div className={styles.generationFilter}>
          <h3>Filter by Generation:</h3>
          <select 
            value={selectedGeneration} 
            onChange={(e) => setSelectedGeneration(e.target.value)}
            className={styles.generationSelect}
          >
            {Object.entries(generations).map(([key, gen]) => (
              <option key={key} value={key}>
                {gen.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.typeFilters}>
          <h3>Filter by Type:</h3>
          <div className={styles.typeButtons}>
            {availableTypes.map((type) => (
              <button
                key={type}
                className={`${styles.typeButton} ${styles[type]} ${selectedTypes.includes(type) ? styles.active : ''}`}
                onClick={() => toggleType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.resultsInfo}>
        <p>
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredList.length)} of {filteredList.length} Pokémon
        </p>
      </div>

      <div className={styles.galleryGrid}>
        {currentItems.length === 0 ? (
          <p className={styles.noResults}>No Pokémon found with selected filters.</p>
        ) : (
          currentItems.map((pokemon) => (
            <Link
              key={pokemon.id}
              to={`/pokemon/${pokemon.id}`}
              state={{ pokemons: filteredList }}
              className={styles.galleryItem}
            >
              <img
                src={pokemon.sprites.other['official-artwork'].front_default}
                alt={pokemon.name}
              />
              <div className={styles.galleryInfo}>
                <span className={styles.pokemonId}>#{pokemon.id.toString().padStart(3, '0')}</span>
                <span className={styles.pokemonName}>{pokemon.name}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {filteredList.length > itemsPerPage && (
        <div className={styles.pagination}>
          <button 
            onClick={goToPrevPage} 
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>

          {getPageNumbers().map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className={styles.paginationEllipsis}>...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum as number)}
                className={`${styles.paginationButton} ${currentPage === pageNum ? styles.active : ''}`}
              >
                {pageNum}
              </button>
            )
          ))}

          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
