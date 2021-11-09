const app = {
    state: {
        catalogId: null,   //服务目录流程的id
    },
    mutations: {
        SET_CATALOG_ID: (state, id) => {
            state.catalogId = id
        }
    }
}

export default app