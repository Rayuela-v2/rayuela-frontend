import {createStore} from "vuex";

const state = () => ({
    project: null,
    currentGamification: {
        badgesRules: [],
        pointRules: []
    },
    currentBadge: null,
    currentScoreRule: null,
});

const mutations = {
    setProject(state, project) {
        state.project = project;
    },
    setCurrentGamification(state, badges) {
        state.currentGamification = badges;
    },
    setScoreRule(state, scoreRule) {
        state.currentScoreRule = scoreRule;
    },
    setCurrentBadge(state, badge) {
        state.currentBadge = badge;
    },
};

const actions = {
    setProject({ commit }, project) {
        commit("setProject", project);
    },
    setCurrentBadge({ commit }, badge) {
        commit("setCurrentBadge", badge);
    },
    setCurrentScoreRule({ commit }, scoreRule) {
        commit("setScoreRule", scoreRule);
    },
};

const getters = {
    project: (state) => state.project,
    currentGamification: (state) => state.currentGamification,
    currentBadge: (state) => state.currentBadge,
};


export const store =  createStore({
    state,
    mutations,
    actions,
    getters,
});
