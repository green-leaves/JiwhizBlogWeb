/* 
 * Copyright 2013-2014 JIWHIZ Consulting Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.jiwhiz.rest.author;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;
import static org.springframework.hateoas.mvc.ControllerLinkBuilder.methodOn;

import javax.inject.Inject;

import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.ResourceAssembler;
import org.springframework.stereotype.Component;

import com.jiwhiz.domain.post.BlogPost;
import com.jiwhiz.domain.post.CommentPost;
import com.jiwhiz.domain.post.CommentPostRepository;

/**
 * @author Yuan Ji
 */
@Component
public class AuthorBlogResourceAssembler implements ResourceAssembler<BlogPost, AuthorBlogResource> {
    @Inject
    PagedResourcesAssembler<CommentPost> assembler;
    
    @Inject
    CommentPostRepository commentPostRepository;
    
    @Override
    public AuthorBlogResource toResource(BlogPost blog) {
        AuthorBlogResource resource = new AuthorBlogResource(blog);
        resource.setCommentCount(commentPostRepository.countByBlogPostId(blog.getId()));
        
        try {
            resource.add(linkTo(methodOn(AuthorBlogRestController.class).getBlogPostById(blog.getId()))
                    .withSelfRel());
            
            Link commentsLink = linkTo(methodOn(AuthorBlogCommentRestController.class)
                    .getCommentPostsByBlogPostId(blog.getId(), null, null))
                    .withRel(AuthorBlogResource.LINK_NAME_COMMENTS);
            resource.add(assembler.appendPaginationParameterTemplates(commentsLink));

        } catch (Exception ex) {
            //do nothing
        }
        
        return resource;
    }

}
