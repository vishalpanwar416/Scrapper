/**
 * Validation Pipeline
 * Orchestrates data flow: Raw Scraper Data -> Sanitization -> Validation -> Database
 */
import ProductValidator from './productValidator.js';
import DataSanitizer from './dataSanitizer.js';
/**
 * Validation Pipeline Service
 * Processes raw scraped data through validation and sanitization stages
 */
export class ValidationPipeline {
    /**
     * Process single product through pipeline
     */
    static processProduct(rawProduct) {
        const warnings = [];
        const errors = [];
        // Stage 1: Sanitize data
        const sanitized = DataSanitizer.sanitizeProduct(rawProduct);
        if (!sanitized.valid) {
            return {
                success: false,
                data: {},
                warnings: [],
                errors: ['Product data failed basic sanitization checks'],
                metadata: {
                    sanitized: false,
                    sanitizationChanges: sanitized.metadata.changes,
                    validationErrors: 0,
                    validationWarnings: 0,
                },
            };
        }
        if (sanitized.metadata.sanitized) {
            warnings.push(`Data was sanitized. Changes: ${sanitized.metadata.changes.join(', ')}`);
        }
        // Stage 2: Validate data
        const sanitizedProduct = {
            title: sanitized.title,
            url: sanitized.url,
            price: sanitized.price,
            originalPrice: sanitized.originalPrice,
            description: sanitized.description,
            imageUrl: sanitized.imageUrl,
            colors: sanitized.colors,
            sizes: ProductValidator.convertSizesFormat(sanitized.sizes),
        };
        const validation = ProductValidator.validate(sanitizedProduct);
        if (!validation.isValid) {
            errors.push(...validation.errors.map(e => `${e.field}: ${e.error}`));
        }
        validation.warnings.forEach(w => {
            warnings.push(`${w.field}: ${w.error}`);
        });
        if (!validation.cleanedData) {
            return {
                success: false,
                data: {},
                warnings,
                errors,
                metadata: {
                    sanitized: sanitized.metadata.sanitized,
                    sanitizationChanges: sanitized.metadata.changes,
                    validationErrors: validation.errors.length,
                    validationWarnings: validation.warnings.length,
                },
            };
        }
        return {
            success: true,
            data: validation.cleanedData,
            warnings,
            errors,
            metadata: {
                sanitized: sanitized.metadata.sanitized,
                sanitizationChanges: sanitized.metadata.changes,
                validationErrors: validation.errors.length,
                validationWarnings: validation.warnings.length,
            },
        };
    }
    /**
     * Process batch of products through pipeline
     */
    static processBatch(rawProducts) {
        const results = [];
        const failedProducts = [];
        let totalWarnings = 0;
        let totalErrors = 0;
        for (const product of rawProducts) {
            const result = this.processProduct(product);
            if (!result) {
                failedProducts.push({
                    product,
                    reason: 'Pipeline processing failed',
                });
                continue;
            }
            if (result.success) {
                results.push(result);
                totalWarnings += result.warnings.length;
            }
            else {
                failedProducts.push({
                    product,
                    reason: result.errors.join('; '),
                });
                totalErrors += result.errors.length;
            }
            totalWarnings += result.metadata.validationWarnings;
            totalErrors += result.metadata.validationErrors;
        }
        return {
            total: rawProducts.length,
            successful: results.length,
            failed: failedProducts.length,
            warnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
            results,
            failedProducts,
            summary: {
                successRate: rawProducts.length > 0 ? (results.length / rawProducts.length) * 100 : 0,
                totalWarnings,
                totalErrors,
            },
        };
    }
    /**
     * Get pipeline report
     */
    static generateReport(batchResult) {
        const lines = [
            '=== VALIDATION PIPELINE REPORT ===',
            `Total Products: ${batchResult.total}`,
            `Successful: ${batchResult.successful} (${batchResult.summary.successRate.toFixed(1)}%)`,
            `Failed: ${batchResult.failed}`,
            `Total Warnings: ${batchResult.summary.totalWarnings}`,
            `Total Errors: ${batchResult.summary.totalErrors}`,
            '',
        ];
        if (batchResult.failedProducts.length > 0) {
            lines.push('FAILED PRODUCTS:');
            batchResult.failedProducts.slice(0, 10).forEach((item, index) => {
                lines.push(`  ${index + 1}. ${item.product.title || 'Unknown'}: ${item.reason}`);
            });
            if (batchResult.failedProducts.length > 10) {
                lines.push(`  ... and ${batchResult.failedProducts.length - 10} more`);
            }
            lines.push('');
        }
        if (batchResult.results.length > 0 && batchResult.results.some(r => r.warnings.length > 0)) {
            lines.push('WARNINGS FROM SUCCESSFUL PRODUCTS:');
            let warningCount = 0;
            for (const result of batchResult.results) {
                if (result.warnings.length > 0 && warningCount < 20) {
                    lines.push(`  ${result.data.title}`);
                    result.warnings.slice(0, 2).forEach(w => {
                        lines.push(`    - ${w}`);
                        warningCount++;
                    });
                }
            }
            if (warningCount > 20) {
                lines.push(`  ... and ${warningCount - 20} more warnings`);
            }
        }
        return lines.join('\n');
    }
}
export default ValidationPipeline;
