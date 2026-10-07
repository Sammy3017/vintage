import imgCubsWhite from './assets/img/Vintagechicagocubswhitecrewneck.png'
import { fetchProducts } from './services/products'
import { t } from './services/i18n'

export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      showDetail: false,
      selectedProduct: null,
      currentView: 'home',
      searchQuery: '',
      activeFilterTag: '',
      selectedBrand: '',
      apiProducts: [],
      isLoadingProducts: false,
      productError: '',
    }
  },
  created() {
    this.loadProducts()
  },
  computed: {
    allProducts() {
      return this.apiProducts
    },
    popularProducts() {
      return this.allProducts.slice(0, 5);
    },
    newProducts() {
      return this.allProducts.slice(5, 10);
    },
    brands() {
      return [...new Set(this.allProducts.map((product) => product.brand).filter(Boolean))];
    },
    pageTitle() {
      if (this.selectedBrand) {
        return t('brandItem', { brand: this.selectedBrand });
      }
      return t('items');
    },
    filteredProducts() {
      if (this.activeFilterTag === 'Sweater Cloth Ninja') {
        return [];
      }
      
      let list = [...this.allProducts];

      if (this.selectedBrand) {
        return list.filter(p => p.brand === this.selectedBrand);
      }

      const keyword = this.searchQuery.trim().toLowerCase();
      if (keyword) {
        return list.filter((product) => {
          const haystack = [product.name, product.brand, product.category, product.color]
            .join(' ')
            .toLowerCase();
          return haystack.includes(keyword);
        });
      }

      return list;
    }
  },
  methods: {
    async loadProducts() {
      this.isLoadingProducts = true
      this.productError = ''
      try {
        this.apiProducts = await fetchProducts()
      } catch (error) {
        this.apiProducts = []
        this.productError = 'productListLoadError'
        console.error('Unable to load products from Firebase:', error)
      } finally {
        this.isLoadingProducts = false
      }
    },
        t,
    toggleLogin() {
      this.isLoggedIn = !this.isLoggedIn;
    },
    openDetail(product) {
      if (!product?.id) return
      this.$router.push({ name: 'detail', params: { id: product.id } })
    },
    handleImageError(event) {
      event.target.src = imgCubsWhite;
      event.target.onerror = null;
    },
    navigateTo(view) {
      this.currentView = view;
      if (view === 'home') {
        this.showDetail = false;
        this.clearFilter();
      }
    },
    handleSearch(query) {
      const keyword = String(query ?? this.searchQuery).trim();
      this.searchQuery = keyword;
      if (!keyword) return;

      this.currentView = 'products';
      this.selectedBrand = '';

      if (keyword.toLowerCase().includes('ninja')) {
        this.activeFilterTag = 'Sweater Cloth Ninja';
      } else {
        this.activeFilterTag = keyword;
      }
    },
    filterByBrand(brand) {
      this.selectedBrand = brand;
      this.activeFilterTag = '';
      this.searchQuery = '';
      this.currentView = 'products';
    },
    clearFilter() {
      this.searchQuery = '';
      this.activeFilterTag = '';
      this.selectedBrand = '';
    }
  }
};