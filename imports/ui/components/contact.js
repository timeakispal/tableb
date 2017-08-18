import './contact.html';

if(Meteor.isClient) {
    Template.contact.onRendered(function() {
    	Session.set("showSearchBar", 0);
    });

    Template.contact.events({
        'submit #contact-form' : function (e,t) {
			e.preventDefault();
          // if someone click on the button ( tag), then we ask the server to execute the function sendEmail (RPC call)
            Meteor.call('sendEmail', $('#email').val(), $('#subject').val(), $('#message').val() + "\n\n" + $('#name').val());
        }
    });

    Template.contact.helpers({

    });

}
// if(Meteor.isServer) {
//     process.env.MAIL_URL="smtp://timea.kispal93%40gmail.com:yyyyy@smtp.gmail.com:465/";
//   // on the server, we create the sendEmail RPC function
//     Meteor.methods({
//     sendEmail: function(email) {
//       // send the email!
//       Email.send({to:email, from:'acemtp@gmail.com', subject:'Thank you for signing up for our project', text:'We will share with you some news about us in a near future. See you soon!'});
//       console.log("The email was sent to the address" + email);
//     }
//     });
// }
