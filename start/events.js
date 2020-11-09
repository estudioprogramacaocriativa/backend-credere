const Event = use("Event");

Event.on("user::register", "Register.store");
Event.on("user::notify", "Register.notify");

Event.on("user::notifyReseler", "User.notifyReseler");
Event.on("user::notifyBlockedAccount", "User.notifyBlockedAccount");

Event.on("password::email", "PasswordEmail.store");
Event.on("password::changed", "PasswordChanged.store");

Event.on("contact::store", "Contact.store");
Event.on("contact::notify", "Contact.notify");

Event.on("newsletter::store", "Newsletter.store");
Event.on("newsletter::notify", "Newsletter.notify");
