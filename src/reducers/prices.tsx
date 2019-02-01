import { fetchAllLists, fetchLastLists, fetchAllLoadedDates, fetchLastListDate } from "../api";
import { PriceFetchAction } from 'src/actions';
import { LoadFetchedPrices, FaildOnFetch, LoadFetchedLists, LoadFetchedDates, LoadFetchedLastListDate } from "src/actions/listPrices";
import { PricesState } from 'src/types/index';
import { LoopReducer, Cmd, loop, Loop, RunCmd, ListCmd } from 'redux-loop';
import * as constants from 'src/constants/index';

const initialState: PricesState = {
    prices: [],
    loading: false,
    error: undefined,
    searchText: "",
    selectedList: "",
    selectOptions: [],
    allListOptions: [],
    selectedDate: { fecha: "" },
    datesLoaded: [],
}

const loadPrices: (date: string) => RunCmd<PriceFetchAction> =
    (date: string) => Cmd.run(fetchLastLists, {
        successActionCreator: LoadFetchedPrices,
        failActionCreator: FaildOnFetch,
        args: [date]
    });

const loadLists: () => RunCmd<PriceFetchAction> =
    () => Cmd.run(fetchAllLists, {
        successActionCreator: LoadFetchedLists,
        failActionCreator: FaildOnFetch
    });

const loadDates: () => RunCmd<PriceFetchAction> =
    () => Cmd.run(fetchAllLoadedDates, {
        successActionCreator: LoadFetchedDates,
        failActionCreator: FaildOnFetch
    });

const loadLastListDate: () => RunCmd<PriceFetchAction> =
    () => Cmd.run(fetchLastListDate, {
        successActionCreator: LoadFetchedLastListDate,
        failActionCreator: FaildOnFetch
    });

const loadListByDate: (date: string) => ListCmd<PriceFetchAction> =
    (date: string) => Cmd.list([loadPrices(date), loadLists(), loadDates()], {
        batch: true
    });

export const prices: LoopReducer<PricesState, PriceFetchAction> =
    (state: PricesState = initialState, action: PriceFetchAction): PricesState | Loop<PricesState, PriceFetchAction> => {
        switch (action.type) {
            case constants.INIT_FECTCH:
                return loop(
                    { ...state, loading: true },
                    loadLastListDate());
            case constants.SUCCESSFUL_PRICE_LIST_FETCH:
                return {
                    ...state,
                    prices: action.data,
                    loading: false
                };
            case constants.SUCCESSFUL_LIST_NAME_FETCH:
                return {
                    ...state,
                    allListOptions: action.data,
                    selectOptions: action.data
                        .filter(lists => lists.fecha === state.selectedDate.fecha)
                        .map(row => row.lista),
                    loading: false
                };
            case constants.SUCCESSFUL_LAST_DATE_FETCH:
                return loop({
                    ...state,
                    selectedDate: { fecha: action.data },
                }, loadListByDate(action.data));
            case constants.SUCCESSFUL_DATES_FETCH:
                return {
                    ...state,
                    datesLoaded: action.data,
                };
            case constants.FAILED_FETCH:
                return { ...state, error: action.error, loading: false };
            case constants.UPDATE_SEARCH_TEXT:
                return {
                    ...state,
                    searchText: action.value
                };
            case constants.UPDATE_SELECTED_LIST:
                return {
                    ...state,
                    selectedList: action.value
                };
            case constants.UPDATE_SELECTED_DATE:
                return loop({
                    ...state,
                    selectedDate: action.value,
                    selectedList: "",
                    selectOptions: state.allListOptions
                        .filter(lists => lists.fecha === action.value.fecha)
                        .map(row => row.lista),
                    loading: true,
                }, loadPrices(action.value.fecha))
        }
        return state;
    }
