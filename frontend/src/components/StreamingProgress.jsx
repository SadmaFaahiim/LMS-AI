import { motion } from 'framer-motion';

export default function StreamingProgress({ current = 0, total = 0, message = '', error = false, stageHistory = [] }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      {/* Animated Spinner */}
      <motion.div
        className="relative w-20 h-20 mb-6"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border-4 border-bg-tertiary rounded-full"></div>
        <div className={`absolute inset-0 border-4 border-t-transparent rounded-full ${error ? 'border-error' : 'border-accent-primary'}`}></div>
      </motion.div>

      {/* Stage Messages History (Claude-like) */}
      {stageHistory.length > 0 && (
        <div className="w-full max-w-md mb-6 space-y-2">
          {stageHistory.map((stage, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex items-center gap-2 text-sm text-text-secondary"
            >
              <span className="text-accent-primary">✓</span>
              <span>{stage.message}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Current Message */}
      <div className={`text-center mb-4 ${error ? 'text-error' : 'text-text-primary'}`}>
        {error ? (
          <>
            <p className="font-semibold mb-2">Generation Failed</p>
            <p className="text-sm">{message}</p>
          </>
        ) : (
          <p className="text-lg font-medium">{message || 'Initializing...'}</p>
        )}
      </div>

      {/* Progress Counter */}
      {total > 0 && (
        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-text-primary mb-2">
            {current} <span className="text-text-secondary">/ {total}</span>
          </div>
          <div className="text-sm text-text-secondary">questions generated</div>
        </div>
      )}

      {/* Progress Bar */}
      {total > 0 && !error && (
        <div className="w-full max-w-md mb-6">
          <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-hover"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Pulsing Indicator */}
      {!error && (
        <motion.div
          className="mt-6 flex items-center gap-2 text-accent-primary text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="w-2 h-2 bg-accent-primary rounded-full"></span>
          <span>AI is generating questions...</span>
        </motion.div>
      )}
    </div>
  );
}
