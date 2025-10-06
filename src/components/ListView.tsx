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

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(70);

  useEffect(() => {
    const loadPokemons = async () => {
      try {
        const data = await fetchAllPokemonDetails(1025);
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, sortBy, sortOrder, pokemons]);

  const handlePokemonClick = (id: number) => {
    navigate(`/pokemon/${id}`, { state: { pokemons: filteredPokemons } });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPokemons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPokemons.length / itemsPerPage);

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

  // Generate page numbers to display
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
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredPokemons.length)} of {filteredPokemons.length} Pokémon
      </div>

      <div className={styles.list}>
        {currentItems.map((pokemon) => (
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

      {/* Pagination Controls */}
      {filteredPokemons.length > itemsPerPage && (
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

export default ListView;
