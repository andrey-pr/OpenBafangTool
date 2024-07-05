import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { getDocumentById } from '../../../docs/document_resolver';
import { getImage } from '../../../docs/img_resolver';

type InfoProps = {
    page: string;
};

type InfoState = {};

class DocumentationView extends React.Component<InfoProps, InfoState> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        const { page } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <MarkdownPreview
                    source={getDocumentById(page)}
                    wrapperElement={{
                        'data-color-mode': 'light',
                    }}
                    rehypeRewrite={async (node) => {
                        if (
                            // @ts-ignore
                            node.tagName === 'a' &&
                            // @ts-ignore
                            node.properties.href.indexOf('#') !== 0
                        ) {
                            // @ts-ignore
                            delete node.properties.href;
                            // @ts-ignore
                        } else if (node.tagName === 'img') {
                            // @ts-ignore
                            node.properties.src = getImage(node.properties.src);
                        }
                    }}
                />
            </div>
        );
    }
}

export default DocumentationView;
