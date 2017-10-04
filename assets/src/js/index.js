const ROUTES = {
    common : require('./modules/common'),
    homepage : require('./modules/homepage'),
};
    
const ROUTER = {
    exec: (controller, action) => {
        action = !action ? 'init' : action;
        
        if (controller && ROUTES[controller] && typeof ROUTES[controller][action] === 'function') {
            ROUTES[controller][action]();
        }
    },
    init: function() {
        const body = document.body;
        const controller = body.getAttribute('data-controller');
        const action = body.getAttribute('data-action');
        
        ROUTER.exec('common');
        ROUTER.exec(controller, action);
    }
};

ROUTER.init();