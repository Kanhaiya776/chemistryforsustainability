import Constants from "acs_search_react/utils/Constants";
import RestService from "acs_search_react/services/RestService";
import { LRUCache } from 'lru-cache'

class RestHelper {
  static DEFAULT_LIMIT: number = Constants.ELEMENTS_PER_PAGE;
  static DEFAULT_SORT_BY: string = 'relevance';
  static DEFAULT_SORT_ORDER: string = 'ASC';
  static ACS_PREFETCH: LRUCache<number, any> = new LRUCache({ max: 10 });

  static async getCombinedData(
    fulltext: string,
    page: number,
    content_types: string[],
    limit: number = RestHelper.DEFAULT_LIMIT,
    sort_by: string = RestHelper.DEFAULT_SORT_BY,
    sort_order: string = RestHelper.DEFAULT_SORT_ORDER,
  ): Promise<any> {
    try {
      if (!(content_types.length)) {
        return { status: false };
      }
      const contentTypesString = content_types.join('+');
      const apiUrl: string = `/combined-api/${contentTypesString}?fulltext=${fulltext}&page=${page}&items_per_page=15&sort_by=${sort_by}&sort_order=${sort_order}`;
      return await RestService.get(apiUrl);
    } catch (error: any) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }

  static async getGctlcData(
    fulltext: string,
    page: number,
    limit: number = RestHelper.DEFAULT_LIMIT,
    sort_by: string = RestHelper.DEFAULT_SORT_BY,
    sort_order: string = RestHelper.DEFAULT_SORT_ORDER
  ): Promise<any> {
    try {
      const apiUrl: string = `/apis/gctlc?fulltext=${fulltext}&page=${page}&items_per_page=${limit}&sort_by=${sort_by}&sort_order=${sort_order}`;
      return await RestService.get(apiUrl);
    } catch (error: any) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }

  static async getNodeData(
    fulltext: string,
    page: number,
    type: string,
    limit: number = RestHelper.DEFAULT_LIMIT,
    sort_by: string = RestHelper.DEFAULT_SORT_BY,
    sort_order: string = RestHelper.DEFAULT_SORT_ORDER,
  ): Promise<any> {
    try {
      const apiUrl: string = `/apis/nodes?fulltext=${fulltext}&page=${page}&items_per_page=10&type=${type}`;
      return await RestService.get(apiUrl);
    } catch (error: any) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }

  static async getAcsPubData(
    fulltext: string,
    page: number,
    limit: number = RestHelper.DEFAULT_LIMIT
  ): Promise<any> {
    try {
      if (this.ACS_PREFETCH.has(page)) {
        return Promise.resolve(this.ACS_PREFETCH.get(page));
      }
      const apiUrl: string = `/apis/acspub?fulltext=${fulltext}&page=${page}&items_per_page=${limit}`;
      const data = await RestService.get(apiUrl);
      this.ACS_PREFETCH.set(page, data);
      return data;
    } catch (error: any) {
      throw new Error(`An error occurred: ${error.message}`);
    }
  }

  static async prefetchAcsPubData(
    fulltext: string,
    page: number,
    limit: number = RestHelper.DEFAULT_LIMIT
  ) {
    if (!this.ACS_PREFETCH.has(page)) {
      console.log('prefetch 1 ahead');
      await this.getAcsPubData(fulltext, page, limit);
    }
    if (!this.ACS_PREFETCH.has(page + 1)) {
      await this.getAcsPubData(fulltext, page + 1, limit);
    }
    if (!this.ACS_PREFETCH.has(page + 2)) {
      await this.getAcsPubData(fulltext, page + 2, limit);
    }
    if (!this.ACS_PREFETCH.has(page + 3)) {
      await this.getAcsPubData(fulltext, page + 3, limit);
    }
  }

  static clearAcsPubDataCache() {
    this.ACS_PREFETCH.clear();
  }
}

export default RestHelper;
