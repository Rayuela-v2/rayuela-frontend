import { createStore } from "vuex";

const state = () => ({
    project: null,
    currentGamification: {
        badgesRules: [],
        pointRules: [],
    },
    currentBadge: null,
    currentScoreRule: null,
    leaderboard: [],
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
    setLeaderboard(state, leaderboard) {
        state.leaderboard = leaderboard;
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
    async getLeaderboard({ commit }) {
        // Datos de prueba para simular un leaderboard
        const dummyLeaderboard = [
            { name: "Juana Díaz", score: 1500, avatarUrl: "https://i.pravatar.cc/36?u=1" },
            { name: "Ana Gómez", score: 1200, avatarUrl: "https://i.pravatar.cc/36?u=2" },
            { name: "Luis Torres", score: 1100, avatarUrl: "https://i.pravatar.cc/36?u=3" },
            { name: "María López", score: 950, avatarUrl: "https://i.pravatar.cc/36?u=4" },
            { name: "Carlos Ruiz", score: 800, avatarUrl: "https://i.pravatar.cc/36?u=5" },
        ];

        // Simulación de una llamada asíncrona
        return new Promise((resolve) => {
            setTimeout(() => {
                commit("setLeaderboard", dummyLeaderboard);
                resolve(dummyLeaderboard);
            }, 500); // Simula un retraso
        });
    }, // Nueva acción para obtener el leaderboard
};

const getters = {
    project: (state) => state.project,
    currentGamification: (state) => state.currentGamification,
    currentBadge: (state) => state.currentBadge,
    leaderboard: (state) => state.leaderboard, // Nuevo getter para el leaderboard
};

export const store = createStore({
    state,
    mutations,
    actions,
    getters,
});
