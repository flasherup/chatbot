module.exports = (userId) => {
    return {
        recipient: {
            id: userId
        },
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [
                        {
                            title: 'Hello, I am chat bot!',
                            subtitle: 'What can I do for you?',
                            buttons: [
                                {
                                    type: 'postback',
                                    title: 'Show my reminders',
                                    payload: 'show_reminders'
                                }, {
                                    type: 'postback',
                                    title: 'Add new reminder',
                                    payload: 'create_reminder'
                                }
                            ]
                        }
                    ]
                }
            }
        }
    }
}