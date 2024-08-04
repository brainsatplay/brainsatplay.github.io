import { ContentData } from 'vitepress';

export function getSorted( posts: ContentData[] ) : ContentData[] {
    return [ ...posts ].sort( ( a, b ) => {
        const dateA = new Date( a.frontmatter.date ).getTime();
        const dateB = new Date( b.frontmatter.date ).getTime();
        return dateB - dateA;
    } );
}

export function formatDate( date: string ) {
    return new Date( date ).toLocaleString( 'EN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    } );
}
