const ROUTES = {
    HOME: '/',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
    ASK_QUESTION: '/ask-question',
    PROFILE: (id: number) => `/profile/${id}`,
    QUESTION: (id: number) => `/question/${id}`,
    TAGS: (id: number) => `/tags/${id}`,
}

export default ROUTES;