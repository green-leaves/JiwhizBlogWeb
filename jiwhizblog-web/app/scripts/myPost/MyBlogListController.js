/**
 * Display list of all blog posts of current logged in user.
 * 
 */
'use strict';

angular.module('jiwhizWeb').controller('MyBlogListController',
['$log', '$rootScope', '$scope', 'AuthorService',
function($log, $rootScope, $scope, AuthorService) {
    $rootScope.activeMenu = {
        'home' : '',
        'blog' : '',
        'about' : '',
        'contact' : '',
        'admin' : 'active'
    };
    $rootScope.showTitle = true;
    
    $rootScope.page_title = 'List Blog';
    $rootScope.page_description = 'See all my blog posts.';
    
    var setup = function( pageNumber ) {
        AuthorService.load()
            .then( function(resource) {
                return resource.$get('blogs', {'page': pageNumber, 'size':10, 'sort':null});
            })
            .then( function(resource)
            {
                $scope.page = resource.page;
                $scope.page.currentPage = $scope.page.number + 1;
                return resource.$get('blogPostList');
            })
            .then( function( blogPostList )
            {
                $scope.blogs = blogPostList;
                blogPostList.forEach( function(blog) {
                    blog.contentFirstParagraph = getFirstSection(blog.content);
                    blog.commentsCollapsed = true;
                    
                    if (blog.commentCount === 0) {
                        return;
                    }

                    // load comments
                    blog.$get('comments', {'page': 0, 'size':100, 'sort':null})
                    .then(function(comments) {
                        return comments.$get('commentPostList');
                    })
                    .then( function(commentPostList) {
                        blog.comments = commentPostList;
                        blog.comments.forEach( function(comment) {
                            setupCommentStatus(comment);
                            setupCommentAuthorActions(comment, $scope);
                            // load author profile
                            comment.$get('author').then(function(author) {
                                comment.author = author;
                            });

                        });
                    });
                });
            })
            ;
        
    };

    setup(0);
    
    $scope.selectBlogPage = function(pageNumber) {
        setup(pageNumber-1); //Spring HATEOAS page starts with 0
    };

    $scope.triggerCommentsCollapse = function(blog) {
        blog.commentsCollapsed = !blog.commentsCollapsed;
    };
    
    $scope.approve = function(comment) {
        comment.$patch('self', {}, {"status" : "APPROVED"}).then( function() {
            setup($scope.page.number); //reload page
        });
    };

    $scope.disapprove = function(comment) {
        comment.$patch('self', {}, {"status" : "PENDING"}).then( function() {
            setup($scope.page.number); //reload page
        });
    };

    $scope.markSpam = function(comment) {
        comment.$patch('self', {}, {"status" : "SPAM"}).then( function() {
            setup($scope.page.number); //reload page
        });
    };

    $scope.unmarkSpam = function(comment) {
        comment.$patch('self', {}, {"status" : "PENDING"}).then( function() {
            setup($scope.page.number); //reload page
        });
    };

}
]);
