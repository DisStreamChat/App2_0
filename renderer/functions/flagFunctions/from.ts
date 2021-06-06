export default (parameter, messages) => {
	return messages.filter(message => message.sender.name.toLowerCase().includes(parameter.toLowerCase()));
};
