import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, ArrowLeft, Star, Gamepad2, 
  Layers, Info, Calendar, MessageSquare, AlertCircle,
  Key, Package, Play, Pause, Volume2, VolumeX, Maximize, Minimize
} from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getProductThumbnail, getProductGallery } from '../utils/assets';

export default function GameDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [galleryImagesList, setGalleryImagesList] = useState([]);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [adding, setAdding] = useState(false);
  const [genresMap, setGenresMap] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clickFeedback, setClickFeedback] = useState(null);
  const [keyQuantity, setKeyQuantity] = useState(1);
  const [generatingKeys, setGeneratingKeys] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => {
    // Fetch genres mapping
    api.get('/genres', { _skipToast: true }).then(({ data }) => {
      const mapping = {};
      (data.genres ?? []).forEach((g) => {
        mapping[g.id] = g.name;
      });
      setGenresMap(mapping);
    }).catch(() => {});

    // Fetch product details and reviews
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const prodRes = await api.get(`/products/${id}`);
        const prodData = prodRes.data.product;
        setProduct(prodData);
        
        let finalActive = null;
        let finalGallery = [];

        // Try to fetch screenshots and videos from live Steam API via our proxy
        if (prodData.steam_appid) {
          try {
            const steamRes = await api.get(`/products/steam-proxy/${prodData.steam_appid}`, { _skipToast: true });
            const appData = steamRes.data[prodData.steam_appid];
            if (appData && appData.success) {
              const gameDetails = appData.data;
              
              // 1. Extract video trailers (try HLS stream first, then fall back to standard webm/mp4 if any)
              const movies = gameDetails.movies ?? [];
              const videoAssets = movies.map(movie => ({
                type: 'video',
                link: movie.hls_h264 || movie.dash_h264 || movie.mp4?.max || movie.webm?.max || movie.mp4?.['480'] || movie.webm?.['480'],
                thumbnail: movie.thumbnail,
                alt: movie.name || 'Game Trailer'
              })).filter(v => v.link);

              // 2. Extract screenshots
              const screenshotAssets = (gameDetails.screenshots ?? []).map(ss => ({
                type: 'image',
                link: ss.path_full,
                thumbnail: ss.path_thumbnail || ss.path_full,
                alt: 'Screenshot'
              }));

              // Merge videos first, then screenshots (just like official Steam store)
              finalGallery = [...videoAssets, ...screenshotAssets];
              if (finalGallery.length > 0) {
                finalActive = finalGallery[0];
              }
            }
          } catch (e) {
            console.warn("Failed to fetch steam assets via proxy", e);
          }
        }

        // Fallback to database images if proxy failed or wasn't applicable
        if (finalGallery.length === 0) {
          const thumbnail = getProductThumbnail(prodData);
          const gallery = getProductGallery(prodData);
          
          finalGallery = gallery.map(link => ({
            type: 'image',
            link: link,
            thumbnail: link,
            alt: 'Screenshot'
          }));

          if (finalGallery.length > 0) {
            finalActive = finalGallery[0];
          } else if (thumbnail) {
            finalActive = { type: 'image', link: thumbnail, thumbnail: thumbnail, alt: 'thumbnail' };
            finalGallery = [finalActive];
          }
        }

        setGalleryImagesList(finalGallery);
        setActiveImage(finalActive);

        const reviewsRes = await api.get(`/products/${id}/reviews`, { _skipToast: true });
        setReviews(reviewsRes.data.reviews ?? []);
      } catch (err) {
        // Axios interceptor will show the error toast
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const triggerClickFeedback = (type) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setClickFeedback(type);
    feedbackTimeoutRef.current = setTimeout(() => {
      setClickFeedback(null);
    }, 800);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      triggerClickFeedback('pause');
    } else {
      videoRef.current.play().then(() => {
        triggerClickFeedback('play');
      }).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      if (volume === 0) setVolume(0.5);
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (e) => {
    if (!videoRef.current) return;
    const newProgress = parseFloat(e.target.value);
    const dur = videoRef.current.duration || 0;
    videoRef.current.currentTime = (newProgress / 100) * dur;
    setProgress(newProgress);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    try {
      await addToCart(product.product_id);
      success(`${product.product_name} added to cart!`);
    } catch {}
    setAdding(false);
  };

  // Load hls.js library for cross-browser HLS stream support (.m3u8)

  const handleGenerateKeys = async () => {
    if (!user?.is_admin) return;
    const quantity = Number(keyQuantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      success('Please choose a valid quantity greater than 0.');
      return;
    }

    setGeneratingKeys(true);
    try {
      const { data } = await api.post(`/admin/products/${product.product_id}/activation-keys`, {
        quantity,
      });
      const generated = data?.activation_items?.length ?? 0;
      success(`${generated} activation key${generated > 1 ? 's' : ''} generated.`);
    } catch (err) {
      // Global interceptor handles the toast.
    }
    setGeneratingKeys(false);
  };

  const handleEditProduct = () => {
    if (!user?.is_admin) return;
    navigate(`/admin?section=products&product=${product.product_id}`);
  };

  const handleDeleteProduct = async () => {
    if (!user?.is_admin) return;
    if (!window.confirm(`Delete ${product.product_name} from the store?`)) return;

    try {
      await api.delete(`/products/${product.product_id}`);
      success(`${product.product_name} deleted.`);
      navigate('/');
    } catch (err) {
      // Global interceptor handles the toast.
    }
  };
  useEffect(() => {
    if (window.Hls) {
      setHlsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.onload = () => {
      setHlsLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Hls.js script");
    };
    document.body.appendChild(script);
  }, []);

  // Initialize and attach HLS stream to video tag
  useEffect(() => {
    let hlsInstance = null;
    if (activeImage && activeImage.type === 'video' && videoRef.current) {
      const video = videoRef.current;
      const src = activeImage.link;
      
      // Force explicit muted state to follow browser policy
      video.muted = isMuted;

      const attemptPlay = () => {
        video.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.log("Play attempt blocked or failed, waiting for user interaction:", err);
          setIsPlaying(false);
        });
      };
      
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari/iOS)
        video.src = src;
        const onLoaded = () => {
          attemptPlay();
          video.removeEventListener('loadedmetadata', onLoaded);
        };
        video.addEventListener('loadedmetadata', onLoaded);
      } else if (window.Hls && window.Hls.isSupported()) {
        // HLS support via hls.js (Chrome/Firefox/Edge)
        hlsInstance = new window.Hls({
          maxMaxBufferLength: 10, // keep buffer short for trailers
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
          attemptPlay();
        });

        // Network or media error auto-recovery
        hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case window.Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('Fatal network error in HLS player, trying to recover...', data);
                hlsInstance.startLoad();
                break;
              case window.Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('Fatal media error in HLS player, trying to recover...', data);
                hlsInstance.recoverMediaError();
                break;
              default:
                console.error('Fatal unrecoverable HLS error:', data);
                hlsInstance.destroy();
                setIsPlaying(false);
                break;
            }
          }
        });
      } else {
        // Fallback for direct links
        if (hlsLoaded) {
          video.src = src;
          const onLoaded = () => {
            attemptPlay();
            video.removeEventListener('loadedmetadata', onLoaded);
          };
          video.addEventListener('loadedmetadata', onLoaded);
        }
      }
    }
    
    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [activeImage, hlsLoaded, isMuted]);

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;
  if (!product) return (
    <div className="page">
      <div className="container">
        <div className="empty-state">
          <AlertCircle size={48} className="text-danger" style={{ marginBottom: 16 }} />
          <h3>Game Not Found</h3>
          <p>The product you are looking for does not exist or was removed.</p>
          <Link to="/" className="btn btn-primary">Back to Store</Link>
        </div>
      </div>
    </div>
  );

  const thumbnail = getProductThumbnail(product);
  
  // Exclude the portrait thumbnail to decide if we switch layout to portrait format
  const secondaryImages = galleryImagesList.filter(img => img.link !== thumbnail);
  
  const galleryImages = galleryImagesList.length > 0
    ? galleryImagesList
    : (thumbnail ? [{ type: 'image', link: thumbnail, thumbnail: thumbnail, alt: 'thumbnail' }] : []);

  return (
    <div className="page">
      <div className="container" style={{ paddingTop: 30 }}>
        <Link to="/" className="nav-back-link">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="game-details-layout">
          {/* Left Column: Image Gallery */}
          <div className="game-gallery">
            <div className={`main-display-wrapper ${secondaryImages.length === 0 ? 'portrait-ratio' : ''}`}>
              {activeImage ? (
                activeImage.type === 'video' ? (
                  <div ref={containerRef} className="custom-video-container">
                    <video 
                      ref={videoRef}
                      key={activeImage.link}
                      className="main-display-video"
                      poster={activeImage.thumbnail}
                      onClick={togglePlay}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      autoPlay
                      muted={isMuted}
                      loop
                    />
                    
                    {/* Feedback visuel au clic sur la vidéo (play/pause) */}
                    {clickFeedback && (
                      <div className={`video-click-feedback ${clickFeedback}`}>
                        {clickFeedback === 'play' ? <Play size={36} fill="currentColor" /> : <Pause size={36} fill="currentColor" />}
                      </div>
                    )}

                    {/* Big center Play button when paused */}
                    {!isPlaying && (
                      <button 
                        className="video-center-play-btn" 
                        onClick={togglePlay} 
                      >
                        <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />
                      </button>
                    )}

                    {/* Custom control bar */}
                    <div className="video-control-bar">
                      <div className="video-progress-container">
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          step="0.1"
                          value={progress} 
                          onChange={handleProgressChange}
                          className="video-progress-bar"
                          style={{ '--value': `${progress}%` }}
                        />
                      </div>
                      
                      <div className="video-controls-row">
                        <div className="video-controls-left">
                          <button onClick={togglePlay} className="video-control-btn" title={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                          </button>

                          <div className="video-volume-container">
                            <button onClick={toggleMute} className="video-control-btn" title={isMuted ? "Unmute" : "Mute"}>
                              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input 
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={isMuted ? 0 : volume}
                              onChange={handleVolumeChange}
                              className="video-volume-slider"
                              style={{ '--value': `${(isMuted ? 0 : volume) * 100}%` }}
                            />
                          </div>

                          <div className="video-time-display">
                            <span className="current-time">{formatTime(currentTime)}</span>
                            <span className="time-separator">/</span>
                            <span className="total-duration">{formatTime(duration)}</span>
                          </div>
                        </div>

                        <div className="video-controls-row-right">
                          <button onClick={toggleFullscreen} className="video-control-btn" title="Fullscreen">
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img className="main-display-bg" src={activeImage.link} alt="" aria-hidden="true" />
                    <img className="main-display-img" src={activeImage.link} alt={product.product_name} />
                  </>
                )
              ) : (
                <div className="main-display-placeholder"><Gamepad2 size={64} /></div>
              )}
            </div>
            
            {galleryImages.length > 1 && (
              <div className="thumbnails-grid">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    className={`thumbnail-btn ${img.type === 'video' ? 'video-type' : ''} ${activeImage?.link === img.link ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                    style={{ position: 'relative' }}
                  >
                    <img src={img.thumbnail || img.link} alt={img.alt || 'screenshot'} />
                    {img.type === 'video' && (
                      <div className="play-overlay" style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        transition: 'background 0.3s ease'
                      }}>
                        <div style={{
                          background: 'rgba(6, 182, 212, 0.8)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                        }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Game Info */}
          <div className="game-info-block">
            <div className={`game-header-row ${secondaryImages.length === 0 ? 'no-thumbnail' : ''}`}>
              <div className="game-header-left">
                <span className="type-badge-large" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {product.type === 'key' ? (
                    <>
                      <Key size={14} /> Steam Key
                    </>
                  ) : (
                    <>
                      <Package size={14} /> Crate
                    </>
                  )}
                </span>
                <h1 className="game-title-text">{product.product_name}</h1>
                
                <div className="game-price-tag">
                  €{(product.price ?? 0).toFixed(2)}
                </div>

                {product.product_genres?.length > 0 && (
                  <div className="game-genres-list">
                    {product.product_genres.map((gId) => (
                      <span key={gId} className="genre-pill">
                        <Layers size={12} /> {genresMap[gId] ?? gId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {secondaryImages.length > 0 && thumbnail && (
                <div className="details-thumbnail-wrapper">
                  <img 
                    className="details-thumbnail-img" 
                    src={thumbnail} 
                    alt={product.product_name} 
                    onError={(e) => {
                      if (product.steam_appid && product.product_thumbnail_link && e.target.src !== product.product_thumbnail_link) {
                        e.target.src = product.product_thumbnail_link;
                      } else {
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                </div>
              )}
            </div>

            <div className="game-description-box">
              <h3>Description</h3>
              <p>{product.description || 'No description available for this game.'}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '0.9rem', color: product.stock === 0 ? 'var(--text-danger)' : 'var(--text-secondary)' }}>
                {product.stock === 0 ? (
                  <strong>Out of stock</strong>
                ) : product.stock > 9 ? (
                  <strong>In stock</strong>
                ) : (
                  <>Available stock: <strong>{product.stock} {product.stock > 1 ? 'keys' : 'key'}</strong></>
                )}
              </span>
            </div>

            <button
              className="btn btn-primary add-to-cart-large"
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              style={product.stock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <ShoppingCart size={20} /> {product.stock === 0 ? 'Out of stock' : adding ? 'Adding...' : 'Add to Cart'}
            </button>

            <div className="delivery-info">
              <Info size={16} />
              <span>Instant digital delivery upon successful checkout. Check your inventory page.</span>
            </div>

            {user?.is_admin && (
              <div className="admin-key-generator">
                <div className="admin-key-generator-head">
                  <div>
                    <h3>Admin key generation</h3>
                    <p>Generate activation keys directly for this product.</p>
                  </div>
                </div>

                <div className="admin-key-generator-row">
                  <label className="form-group admin-key-generator-field">
                    <span className="form-label">Quantity</span>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      step="1"
                      value={keyQuantity}
                      onChange={(e) => setKeyQuantity(e.target.value)}
                    />
                  </label>

                  <button
                    className="btn btn-secondary admin-key-generator-btn"
                    onClick={handleGenerateKeys}
                    disabled={generatingKeys}
                  >
                    {generatingKeys ? 'Generating...' : 'Generate keys'}
                  </button>
                </div>
              </div>
            )}

            {user?.is_admin && (
              <div className="admin-product-actions">
                <button className="btn btn-secondary" onClick={handleEditProduct}>
                  Edit game
                </button>
                <button className="btn btn-danger" onClick={handleDeleteProduct}>
                  Delete game
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
